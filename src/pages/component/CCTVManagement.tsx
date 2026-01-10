import { Camera, CheckCircle2, Edit2, MapPin, Plus, Trash2, Video, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { db } from '../../firebase/firebase';

interface CCTV {
  id?: string;
  placeName: string;
  rtspLink: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'inactive';
  createdAt?: any;
  updatedAt?: any;
}

const CCTVManagement = () => {
  const [cameras, setCameras] = useState<CCTV[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<CCTV | null>(null);
  
  const [formData, setFormData] = useState<Omit<CCTV, 'id' | 'createdAt' | 'updatedAt'>>({
    placeName: '',
    rtspLink: '',
    latitude: 0,
    longitude: 0,
    status: 'active',
  });

  // Real-time listener for CCTV cameras
  useEffect(() => {
    const q = query(collection(db, 'cctv_cameras'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const camerasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CCTV[];
      
      setCameras(camerasData);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to CCTV cameras:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const validateForm = (): boolean => {
    if (!formData.placeName.trim()) {
      alert('Please enter CCTV place name');
      return false;
    }
    if (!formData.rtspLink.trim()) {
      alert('Please enter RTSP link');
      return false;
    }
    if (!formData.rtspLink.startsWith('rtsp://')) {
      alert('RTSP link must start with rtsp://');
      return false;
    }
    if (!formData.latitude || formData.latitude === 0) {
      alert('Please enter valid latitude');
      return false;
    }
    if (!formData.longitude || formData.longitude === 0) {
      alert('Please enter valid longitude');
      return false;
    }
    if (isNaN(formData.latitude) || isNaN(formData.longitude)) {
      alert('Latitude and longitude must be valid numbers');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;

    try {
      await addDoc(collection(db, 'cctv_cameras'), {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      resetForm();
      setIsAdding(false);
      alert('CCTV camera added successfully!');
    } catch (error) {
      console.error('Error adding CCTV camera:', error);
      alert('Failed to add CCTV camera. Please try again.');
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !validateForm()) return;

    try {
      await updateDoc(doc(db, 'cctv_cameras', editingId), {
        ...formData,
        updatedAt: new Date(),
      });
      
      resetForm();
      setEditingId(null);
      alert('CCTV camera updated successfully!');
    } catch (error) {
      console.error('Error updating CCTV camera:', error);
      alert('Failed to update CCTV camera. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this CCTV camera?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'cctv_cameras', id));
      alert('CCTV camera deleted successfully!');
    } catch (error) {
      console.error('Error deleting CCTV camera:', error);
      alert('Failed to delete CCTV camera. Please try again.');
    }
  };

  const handleEdit = (camera: CCTV) => {
    setFormData({
      placeName: camera.placeName,
      rtspLink: camera.rtspLink,
      latitude: camera.latitude,
      longitude: camera.longitude,
      status: camera.status,
    });
    setEditingId(camera.id!);
    setIsAdding(false);
  };

  const resetForm = () => {
    setFormData({
      placeName: '',
      rtspLink: '',
      latitude: 0,
      longitude: 0,
      status: 'active',
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleViewLive = (camera: CCTV) => {
    setSelectedCamera(camera);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CCTV Management</h1>
          <p className="text-gray-500 mt-1">Manage CCTV cameras and RTSP links for real-time monitoring</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add CCTV Camera
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit CCTV Camera' : 'Add New CCTV Camera'}</CardTitle>
            <CardDescription>
              Enter CCTV camera details including place name, coordinates, and RTSP link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-xs text-gray-500">Name or location of the CCTV camera</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rtspLink">
                  RTSP Link <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="rtspLink"
                  placeholder="e.g., rtsp://username:password@ip:port/path"
                  value={formData.rtspLink}
                  onChange={(e) => setFormData({ ...formData, rtspLink: e.target.value })}
                />
                <p className="text-xs text-gray-500">RTSP stream URL (must start with rtsp://)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-500">GPS latitude coordinate of the camera location</p>
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
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-500">GPS longitude coordinate of the camera location</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.status === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, status: 'active' })}
                  className={formData.status === 'active' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Active
                </Button>
                <Button
                  type="button"
                  variant={formData.status === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, status: 'inactive' })}
                  className={formData.status === 'inactive' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                >
                  <X className="w-4 h-4 mr-2" />
                  Inactive
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={editingId ? handleUpdate : handleAdd}
                className="bg-orange-600 hover:bg-orange-700 text-white"
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

      {/* CCTV Cameras List */}
      <Card>
        <CardHeader>
          <CardTitle>All CCTV Cameras ({cameras.length})</CardTitle>
          <CardDescription>
            Manage and monitor all CCTV cameras in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cameras.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No CCTV cameras added yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Click "Add CCTV Camera" to add your first camera
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cameras.map((camera) => (
                <Card key={camera.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Camera className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{camera.placeName}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {camera.latitude.toFixed(6)}, {camera.longitude.toFixed(6)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={camera.status === 'active' ? 'default' : 'outline'}
                        className={camera.status === 'active' ? 'bg-green-600' : 'bg-gray-400'}
                      >
                        {camera.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium mb-1">RTSP Link</p>
                      <p className="text-sm text-gray-900 font-mono truncate">{camera.rtspLink}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewLive(camera)}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        View Live
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(camera)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(camera.id!)}
                        className="border-red-600 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live View Modal */}
      {selectedCamera && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCamera(null)}
        >
          <Card
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedCamera.placeName} - Live Feed</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4" />
                    {selectedCamera.latitude.toFixed(6)}, {selectedCamera.longitude.toFixed(6)}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCamera(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                {/* Note: Browsers cannot directly play RTSP streams.
                    You need a backend service to convert RTSP to HLS/WebRTC/WebSocket.
                    For now, showing a placeholder with camera info. */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2">Live CCTV Feed</p>
                    <p className="text-sm text-gray-300 mb-4">{selectedCamera.placeName}</p>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-xs text-gray-300 mb-2">RTSP Link:</p>
                      <p className="text-sm font-mono break-all">{selectedCamera.rtspLink}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                      Note: RTSP streams require a backend service to convert to web-compatible format (HLS/WebRTC)
                    </p>
                  </div>
                </div>
                {selectedCamera.status === 'active' && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CCTVManagement;
