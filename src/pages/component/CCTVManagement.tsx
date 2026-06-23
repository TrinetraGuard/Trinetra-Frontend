import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import {
  Camera,
  Edit2,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
  Video,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CCTVStreamPlayer } from '@/components/cctvcrowd/CCTVStreamPlayer';
import { CctvStreamRelayBanner } from '@/components/cctvcrowd/CctvStreamRelayBanner';
import { checkRTSPStatus } from '@/lib/cctvApi';
import {
  formatCctvTimestamp,
  getCameraChannelOrder,
  isValidStreamUrl,
  maskRtspCredentials,
  normalizeRtspUrl,
  sortCamerasByChannel,
} from '@/lib/cctv';
import type { CCTV } from '@/types/cctv';
import { admin } from '@/lib/adminTheme';
import { db } from '../../firebase/firebase';
import { importSiteCameras, useCctvCameras } from '@/hooks/useCctvCameras';

const CCTVManagement = () => {
  const { cameras, loading } = useCctvCameras();
  const [isAdding, setIsAdding] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<CCTV | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<Set<string>>(new Set());
  const [formError, setFormError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [importing, setImporting] = useState(false);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const initialStatusCheckDone = useRef(false);

  const orderedCameras = useMemo(() => sortCamerasByChannel(cameras), [cameras]);
  const liveCount = orderedCameras.filter((camera) => camera.status === 'active').length;
  const offlineCount = orderedCameras.length - liveCount;

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

  const checkAllCameraStatuses = async () => {
    if (orderedCameras.length === 0 || refreshingAll) return;

    setRefreshingAll(true);
    for (const camera of orderedCameras) {
      await checkCameraStatus(camera);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    setRefreshingAll(false);
  };

  useEffect(() => {
    if (loading || orderedCameras.length === 0 || initialStatusCheckDone.current) return;
    initialStatusCheckDone.current = true;
    void checkAllCameraStatuses();
  }, [loading, orderedCameras.length]);

  const handleImportSiteCameras = async () => {
    setImporting(true);
    setActionMessage('');
    try {
      const count = await importSiteCameras();
      setActionMessage(
        count > 0
          ? `Imported ${count} site NVR camera${count === 1 ? '' : 's'}.`
          : 'All 8 site cameras are already registered.'
      );
    } catch (error) {
      console.error('Error importing site cameras:', error);
      setFormError('Failed to import site cameras.');
    } finally {
      setImporting(false);
    }
  };

  const validateForm = (): boolean => {
    setFormError('');

    const placeName = formData.placeName.trim();
    const streamUrl = formData.rtspLink.trim();

    if (!placeName) {
      setFormError('Please enter CCTV place name.');
      return false;
    }
    if (!streamUrl) {
      setFormError('Please enter an RTSP or HLS stream URL.');
      return false;
    }
    if (!isValidStreamUrl(streamUrl)) {
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

    const payload = {
      placeName: formData.placeName.trim(),
      rtspLink: normalizeRtspUrl(formData.rtspLink.trim()),
      latitude: formData.latitude,
      longitude: formData.longitude,
    };

    try {
      const initialStatus = await checkRTSPStatus(payload.rtspLink);

      await addDoc(collection(db, 'cctv_cameras'), {
        ...payload,
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

    const payload = {
      placeName: formData.placeName.trim(),
      rtspLink: normalizeRtspUrl(formData.rtspLink.trim()),
      latitude: formData.latitude,
      longitude: formData.longitude,
    };

    try {
      const newStatus = await checkRTSPStatus(payload.rtspLink, editingId);

      await updateDoc(doc(db, 'cctv_cameras', editingId), {
        ...payload,
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
    setIsAdding(cameras.length === 0);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={admin.iconWrapSolid}>
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <h1 className={admin.title}>CCTV Management</h1>
            <p className={admin.subtitle}>
              Manage CCTV cameras and RTSP links for real-time crowd monitoring
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => void handleImportSiteCameras()}
            disabled={importing}
          >
            {importing ? 'Importing…' : 'Import site NVR (8 cameras)'}
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setIsAdding(true);
              setActionMessage('');
            }}
            className={admin.cta}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add CCTV Camera
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className={admin.success}>
          {actionMessage}
        </div>
      )}

      <CctvStreamRelayBanner />

      {(isAdding || editingId) && (
        <Card className={admin.card}>
          <CardHeader className={admin.cardHeader}>
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
                className={admin.cta}
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

      <Card className={admin.card}>
        <CardHeader className={`${admin.cardHeader} space-y-4`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>All CCTV Cameras ({orderedCameras.length})</CardTitle>
              <CardDescription>
                Live status for every registered camera — feeds appear in Crowd Monitoring
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void checkAllCameraStatuses()}
              disabled={refreshingAll || orderedCameras.length === 0}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshingAll ? 'animate-spin' : ''}`} />
              {refreshingAll ? 'Checking all…' : 'Refresh all status'}
            </Button>
          </div>

          {orderedCameras.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{orderedCameras.length}</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Live</p>
                <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-emerald-900">
                  {liveCount}
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Offline</p>
                <p className="mt-1 text-2xl font-bold text-gray-700">{offlineCount}</p>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          {orderedCameras.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Camera className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <p className="font-medium text-gray-500">No CCTV cameras added yet</p>
              <p className="mt-2 text-sm text-gray-400">
                Import the site NVR pack or use the form above to register cameras
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-b-lg border-t border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-14 font-semibold">#</TableHead>
                    <TableHead className="min-w-[160px] font-semibold">Camera</TableHead>
                    <TableHead className="hidden min-w-[180px] font-semibold md:table-cell">
                      Location
                    </TableHead>
                    <TableHead className="hidden min-w-[220px] font-semibold lg:table-cell">
                      Stream URL
                    </TableHead>
                    <TableHead className="min-w-[120px] font-semibold">Status</TableHead>
                    <TableHead className="hidden min-w-[130px] font-semibold sm:table-cell">
                      Last checked
                    </TableHead>
                    <TableHead className="w-[180px] text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderedCameras.map((camera) => {
                    const channel = getCameraChannelOrder(camera);
                    const isLive = camera.status === 'active';
                    const isChecking = camera.id ? checkingStatus.has(camera.id) : false;

                    return (
                      <TableRow key={camera.id ?? camera.placeName} className="hover:bg-gray-50/80">
                        <TableCell className="font-mono text-sm text-gray-500">
                          {channel < 999 ? channel : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              <Camera className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-900">{camera.placeName}</p>
                              <p className="truncate text-xs text-gray-500 md:hidden">
                                {camera.latitude.toFixed(4)}, {camera.longitude.toFixed(4)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-start gap-1.5 text-sm text-gray-600">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span className="font-mono text-xs">
                              {camera.latitude.toFixed(6)}, {camera.longitude.toFixed(6)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <p
                            className="max-w-[280px] truncate font-mono text-xs text-gray-600"
                            title={maskRtspCredentials(camera.rtspLink)}
                          >
                            {maskRtspCredentials(camera.rtspLink)}
                          </p>
                        </TableCell>
                        <TableCell>
                          {isChecking ? (
                            <Badge variant="outline" className="gap-1.5 border-gray-300 bg-white">
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Checking…
                            </Badge>
                          ) : isLive ? (
                            <Badge className="gap-1.5 border-emerald-600 bg-emerald-600 hover:bg-emerald-600">
                              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                              <Wifi className="h-3 w-3" />
                              Live
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="gap-1.5 border-gray-300 bg-gray-100 text-gray-700"
                            >
                              <WifiOff className="h-3 w-3" />
                              Offline
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden text-sm text-gray-500 sm:table-cell">
                          {camera.lastStatusCheck
                            ? formatCctvTimestamp(camera.lastStatusCheck)
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => setSelectedCamera(camera)}
                              disabled={!isLive}
                              title="View live feed"
                            >
                              <Video className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => void checkCameraStatus(camera)}
                              disabled={isChecking || !camera.id}
                              title="Refresh status"
                            >
                              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => handleEdit(camera)}
                              title="Edit camera"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => camera.id && void handleDelete(camera.id)}
                              title="Delete camera"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
