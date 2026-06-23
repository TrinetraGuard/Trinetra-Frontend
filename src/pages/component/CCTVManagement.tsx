import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { Camera, Edit2, MapPin, Plus, RefreshCw, Trash2, Video, WifiOff, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CCTVStreamPlayer } from '@/components/cctvcrowd/CCTVStreamPlayer';
import { checkRTSPStatus } from '@/lib/cctvApi';
import { formatCctvTimestamp, isStreamProxyConfigured, isValidRtspUrl, maskRtspCredentials } from '@/lib/cctv';
import type { CCTV } from '@/types/cctv';
import { db } from '../../firebase/firebase';

const CCTVManagement = () => {
  const [cameras, setCameras] = useState<CCTV[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<CCTV | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<Set<string>>(new Set());
  const [formError, setFormError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<Omit<CCTV, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'lastStatusCheck'>>({
    placeName: '',
    rtspLink: '',
    latitude: 0,
    longitude: 0,
  });

  const checkCameraStatus = async (camera: CCTV) => {
    if (!camera.id || checkingStatus.has(camera.id)) return;

    setCheckingStatus((prev) => new Set(prev).add(camera.id!));

    try {
      const result = await checkRTSPStatus(camera.rtspLink, camera.id);

      await updateDoc(doc(db, 'cctv_cameras', camera.id!), {
        status: result.status,
        lastStatusCheck: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(`Error checking status for camera ${camera.id}:`, error);
    } finally {
      setCheckingStatus((prev) => {
        const updated = new Set(prev);
        updated.delete(camera.id!);
        return updated;
      });
    }
  };

  useEffect(() => {
    const checkAllCameras = () => {
      cameras.forEach((camera) => {
        if (camera.id && camera.rtspLink) {
          void checkCameraStatus(camera);
        }
      });
    };

    if (cameras.length > 0) {
      checkAllCameras();
    }

    statusCheckIntervalRef.current = setInterval(checkAllCameras, 30000);

    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameras]);

  useEffect(() => {
    const q = query(collection(db, 'cctv_cameras'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const camerasData = snapshot.docs.map((snapshotDoc) => ({
          id: snapshotDoc.id,
          ...snapshotDoc.data(),
        })) as CCTV[];

        setCameras(camerasData);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to CCTV cameras:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const validateForm = (): boolean => {
    setFormError('');

    if (!formData.placeName.trim()) {
      setFormError('Please enter CCTV place name.');
      return false;
    }
    if (!formData.rtspLink.trim()) {
      setFormError('Please enter an RTSP or HLS stream URL.');
      return false;
    }
    if (!isValidRtspUrl(formData.rtspLink) && !formData.rtspLink.startsWith('http')) {
      setFormError('Enter a valid rtsp:// URL or an http(s):// HLS stream URL.');
      return false;
    }
    if (!formData.latitude || formData.latitude === 0) {
      setFormError('Please enter a valid latitude.');
      return false;
    }
    if (!formData.longitude || formData.longitude === 0) {
      setFormError('Please enter a valid longitude.');
      return false;
    }
    if (Number.isNaN(formData.latitude) || Number.isNaN(formData.longitude)) {
      setFormError('Latitude and longitude must be valid numbers.');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;

    try {
      const initialStatus = await checkRTSPStatus(formData.rtspLink);

      await addDoc(collection(db, 'cctv_cameras'), {
        ...formData,
        status: initialStatus.status,
        lastStatusCheck: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      resetForm();
      setActionMessage('CCTV camera added successfully.');
    } catch (error) {
      console.error('Error adding CCTV camera:', error);
      setFormError('Failed to add CCTV camera. Please try again.');
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !validateForm()) return;

    try {
      const newStatus = await checkRTSPStatus(formData.rtspLink, editingId);

      await updateDoc(doc(db, 'cctv_cameras', editingId), {
        ...formData,
        status: newStatus.status,
        lastStatusCheck: new Date(),
        updatedAt: new Date(),
      });

      resetForm();
      setActionMessage('CCTV camera updated successfully.');
    } catch (error) {
      console.error('Error updating CCTV camera:', error);
      setFormError('Failed to update CCTV camera. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this CCTV camera?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'cctv_cameras', id));
      setActionMessage('CCTV camera deleted successfully.');
    } catch (error) {
      console.error('Error deleting CCTV camera:', error);
      setFormError('Failed to delete CCTV camera. Please try again.');
    }
  };

  const handleEdit = (camera: CCTV) => {
    setFormData({
      placeName: camera.placeName,
      rtspLink: camera.rtspLink,
      latitude: camera.latitude,
      longitude: camera.longitude,
    });
    setEditingId(camera.id!);
    setIsAdding(false);
    setFormError('');
    setActionMessage('');
  };

  const resetForm = () => {
    setFormData({
      placeName: '',
      rtspLink: '',
      latitude: 0,
      longitude: 0,
    });
    setIsAdding(false);
    setEditingId(null);
    setFormError('');
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CCTV Management</h1>
          <p className="mt-1 text-gray-500">
            Manage CCTV cameras and RTSP links for real-time crowd monitoring
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAdding(true);
            setActionMessage('');
          }}
          className="bg-orange-600 text-white hover:bg-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add CCTV Camera
        </Button>
      </div>

      {!isStreamProxyConfigured() && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Production setup:</strong> Browsers cannot play RTSP directly. Set{' '}
          <code className="rounded bg-amber-100 px-1">VITE_CCTV_PROXY_URL</code> to your go2rtc or
          MediaMTX service so live feeds appear in Crowd Monitoring.
        </div>
      )}

      {actionMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {actionMessage}
        </div>
      )}

      {(isAdding || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit CCTV Camera' : 'Add New CCTV Camera'}</CardTitle>
            <CardDescription>
              Enter camera details including place name, coordinates, and RTSP/HLS stream URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="placeName">
                  CCTV Place Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="placeName"
                  placeholder="e.g., Main Gate Entrance"
                  value={formData.placeName}
                  onChange={(e) => setFormData({ ...formData, placeName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rtspLink">
                  RTSP / Stream URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="rtspLink"
                  placeholder="rtsp://username:password@ip:554/stream"
                  value={formData.rtspLink}
                  onChange={(e) => setFormData({ ...formData, rtspLink: e.target.value })}
                />
                <p className="text-xs text-gray-500">
                  RTSP for IP cameras, or an https://…/stream.m3u8 HLS URL
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="latitude">
                  Latitude <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 19.9975"
                  value={formData.latitude || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">
                  Longitude <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 73.7898"
                  value={formData.longitude || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={editingId ? handleUpdate : handleAdd}
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                {editingId ? 'Update Camera' : 'Add Camera'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All CCTV Cameras ({cameras.length})</CardTitle>
          <CardDescription>
            Cameras added here appear automatically in Crowd Monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cameras.length === 0 ? (
            <div className="py-12 text-center">
              <Camera className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <p className="font-medium text-gray-500">No CCTV cameras added yet</p>
              <p className="mt-2 text-sm text-gray-400">
                Click &quot;Add CCTV Camera&quot; to register your first stream
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cameras.map((camera) => (
                <Card key={camera.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="relative aspect-video bg-black">
                    {camera.status === 'active' ? (
                      <CCTVStreamPlayer
                        camera={camera}
                        className="h-full w-full"
                        autoPlay
                        muted
                        showControls={false}
                        showLiveBadge
                        compact
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-200">
                        <WifiOff className="h-10 w-10 text-gray-500" />
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate text-lg">{camera.placeName}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {camera.latitude.toFixed(6)}, {camera.longitude.toFixed(6)}
                        </CardDescription>
                        {camera.lastStatusCheck && (
                          <p className="mt-1 text-xs text-gray-500">
                            Last checked: {formatCctvTimestamp(camera.lastStatusCheck)}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={camera.status === 'active' ? 'default' : 'outline'}
                        className={`flex items-center gap-1 ${
                          camera.status === 'active' ? 'bg-green-600' : 'bg-gray-400'
                        }`}
                      >
                        {camera.status === 'active' ? (
                          <>
                            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                            Online
                          </>
                        ) : (
                          <>
                            <WifiOff className="h-3 w-3" />
                            Offline
                          </>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="mb-1 text-xs font-medium text-gray-500">Stream URL</p>
                      <p className="truncate font-mono text-sm text-gray-900">
                        {maskRtspCredentials(camera.rtspLink)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedCamera(camera)}
                        disabled={camera.status === 'inactive'}
                      >
                        <Video className="mr-2 h-4 w-4" />
                        View Live
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void checkCameraStatus(camera)}
                        disabled={checkingStatus.has(camera.id!)}
                        title="Check Status"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${checkingStatus.has(camera.id!) ? 'animate-spin' : ''}`}
                        />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(camera)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleDelete(camera.id!)}
                        className="border-red-600 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCamera && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedCamera(null)}
        >
          <Card className="max-w-5xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedCamera.placeName} — Live Feed</CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedCamera.latitude.toFixed(6)}, {selectedCamera.longitude.toFixed(6)}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedCamera(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-video">
                <CCTVStreamPlayer
                  camera={selectedCamera}
                  className="h-full w-full"
                  autoPlay
                  muted={false}
                  showControls
                  showLiveBadge
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CCTVManagement;
