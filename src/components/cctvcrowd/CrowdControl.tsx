import { Activity, Camera, Grid, List, MapPin, Maximize2, Monitor, RefreshCw, Video, Wifi, WifiOff, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { db } from '@/firebase/firebase';

interface CCTV {
  id?: string;
  placeName: string;
  rtspLink: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'inactive';
  lastStatusCheck?: Date | { toDate: () => Date };
  createdAt?: Date | { toDate: () => Date };
  updatedAt?: Date | { toDate: () => Date };
}

const CrowdControl = () => {
  const [cameras, setCameras] = useState<CCTV[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<CCTV | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

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

  const filteredCameras = cameras.filter(camera => {
    if (filterStatus === 'active') return camera.status === 'active';
    if (filterStatus === 'inactive') return camera.status === 'inactive';
    return true;
  });

  const activeCameras = cameras.filter(c => c.status === 'active').length;
  const inactiveCameras = cameras.filter(c => c.status === 'inactive').length;

  const handleViewLive = (camera: CCTV) => {
    setSelectedCamera(camera);
  };

  const closeLiveView = () => {
    setSelectedCamera(null);
  };

  const formatDate = (date: Date | { toDate: () => Date } | undefined) => {
    if (!date) return 'Never';
    const dateObj = typeof date === 'object' && 'toDate' in date ? date.toDate() : new Date(date as Date);
    return dateObj.toLocaleTimeString();
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Monitor className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crowd Monitoring</h1>
              <p className="text-gray-500 mt-1">Real-time monitoring of all CCTV cameras for crowd management</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Active Cameras</p>
                  <p className="text-xl font-bold text-green-700">{activeCameras}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600 font-medium">Offline Cameras</p>
                  <p className="text-xl font-bold text-gray-700">{inactiveCameras}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters and View Controls */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-gray-600" />
              <div>
                <CardTitle className="text-lg">Filters & View Options</CardTitle>
                <CardDescription>Filter cameras by status and choose your preferred view</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Status Filter:</span>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                  className={filterStatus === 'all' ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'border-gray-300'}
                >
                  All ({cameras.length})
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('active')}
                  className={filterStatus === 'active' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-gray-300'}
                >
                  <Wifi className="w-3 h-3 mr-1" />
                  Active ({activeCameras})
                </Button>
                <Button
                  variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('inactive')}
                  className={filterStatus === 'inactive' ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'border-gray-300'}
                >
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline ({inactiveCameras})
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">View Mode:</span>
              <div className="flex gap-2 border border-gray-200 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`${viewMode === 'grid' ? 'bg-gray-900 text-white hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`${viewMode === 'list' ? 'bg-gray-900 text-white hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cameras Display */}
      {filteredCameras.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-lg">No cameras found</p>
              <p className="text-sm text-gray-400 mt-2">
                {filterStatus === 'all' 
                  ? 'No CCTV cameras have been added yet. Add cameras from CCTV Management.'
                  : `No ${filterStatus} cameras found.`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCameras.map((camera) => (
            <Card 
              key={camera.id} 
              className="hover:shadow-xl transition-all duration-300 overflow-hidden border-gray-200 group"
            >
              <div className="relative">
                {/* Camera Feed Placeholder */}
                <div className={`aspect-video relative overflow-hidden ${
                  camera.status === 'active' 
                    ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900' 
                    : 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600'
                }`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`p-6 rounded-full ${
                      camera.status === 'active' 
                        ? 'bg-white/10 backdrop-blur-sm' 
                        : 'bg-white/5'
                    }`}>
                      <Camera className={`w-16 h-16 ${
                        camera.status === 'active' 
                          ? 'text-white opacity-70' 
                          : 'text-gray-300 opacity-50'
                      }`} />
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="absolute top-3 left-3 z-10">
                    <Badge
                      variant={camera.status === 'active' ? 'default' : 'outline'}
                      className={`${
                        camera.status === 'active' 
                          ? 'bg-green-600 border-green-600 text-white shadow-lg' 
                          : 'bg-gray-600 border-gray-600 text-white'
                      } flex items-center gap-1.5 px-3 py-1`}
                    >
                      {camera.status === 'active' ? (
                        <>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <Wifi className="w-3 h-3" />
                          <span className="font-semibold">Online</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-3 h-3" />
                          <span className="font-semibold">Offline</span>
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Camera Name Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4">
                    <p className="text-white font-bold text-lg drop-shadow-lg">{camera.placeName}</p>
                  </div>

                  {/* View Button */}
                  <div className="absolute top-3 right-3 z-10">
                    <Button
                      size="sm"
                      onClick={() => handleViewLive(camera)}
                      className={`${
                        camera.status === 'active' 
                          ? 'bg-white hover:bg-gray-100 text-gray-900 shadow-lg' 
                          : 'bg-gray-400 text-white cursor-not-allowed'
                      } transition-all`}
                      disabled={camera.status === 'inactive'}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Overlay on hover */}
                  {camera.status === 'active' && (
                    <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-all duration-300"></div>
                  )}
                </div>
              </div>

              <CardContent className="p-5 bg-white">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="font-mono text-xs truncate">
                      {camera.latitude.toFixed(6)}, {camera.longitude.toFixed(6)}
                    </span>
                  </div>
                  
                  {camera.lastStatusCheck && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                      <RefreshCw className="w-3 h-3 text-gray-400" />
                      <span>Last checked: {formatDate(camera.lastStatusCheck)}</span>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full border-2 transition-all ${
                      camera.status === 'active' 
                        ? 'border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700' 
                        : 'border-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={() => handleViewLive(camera)}
                    disabled={camera.status === 'inactive'}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    {camera.status === 'active' ? 'View Live Feed' : 'Camera Offline'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCameras.map((camera) => (
            <Card 
              key={camera.id} 
              className="hover:shadow-lg transition-all duration-300 border-gray-200"
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Camera Preview */}
                  <div className={`relative w-full sm:w-64 h-48 sm:h-36 rounded-lg flex-shrink-0 overflow-hidden ${
                    camera.status === 'active' 
                      ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900' 
                      : 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600'
                  }`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`p-4 rounded-full ${
                        camera.status === 'active' 
                          ? 'bg-white/10 backdrop-blur-sm' 
                          : 'bg-white/5'
                      }`}>
                        <Camera className={`w-12 h-12 ${
                          camera.status === 'active' 
                            ? 'text-white opacity-70' 
                            : 'text-gray-300 opacity-50'
                        }`} />
                      </div>
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant={camera.status === 'active' ? 'default' : 'outline'}
                        className={`${
                          camera.status === 'active' 
                            ? 'bg-green-600 border-green-600 text-white' 
                            : 'bg-gray-600 border-gray-600 text-white'
                        } flex items-center gap-1.5 px-2.5 py-1`}
                      >
                        {camera.status === 'active' ? (
                          <>
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            <Wifi className="w-3 h-3" />
                            <span className="font-semibold text-xs">Online</span>
                          </>
                        ) : (
                          <>
                            <WifiOff className="w-3 h-3" />
                            <span className="font-semibold text-xs">Offline</span>
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  {/* Camera Details */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{camera.placeName}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="font-mono text-xs text-gray-700">
                              {camera.latitude.toFixed(6)}, {camera.longitude.toFixed(6)}
                            </span>
                          </div>
                          {camera.lastStatusCheck && (
                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                              <RefreshCw className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">Checked: {formatDate(camera.lastStatusCheck)}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-500 font-semibold mb-1.5">RTSP Stream URL</p>
                          <p className="text-sm font-mono text-gray-900 break-all">{camera.rtspLink}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewLive(camera)}
                        disabled={camera.status === 'inactive'}
                        className={`ml-4 border-2 ${
                          camera.status === 'active' 
                            ? 'border-blue-600 text-blue-600 hover:bg-blue-50' 
                            : 'border-gray-300 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        View Live
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Live View Modal */}
      {selectedCamera && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeLiveView}
        >
          <Card
            className="max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-b border-gray-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white">{selectedCamera.placeName}</CardTitle>
                    <CardDescription className="text-gray-300 flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span className="font-mono text-xs">
                        {selectedCamera.latitude.toFixed(6)}, {selectedCamera.longitude.toFixed(6)}
                      </span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={selectedCamera.status === 'active' ? 'default' : 'outline'}
                    className={`${
                      selectedCamera.status === 'active' 
                        ? 'bg-green-600 border-green-500' 
                        : 'bg-gray-600 border-gray-500'
                    } flex items-center gap-1.5 px-3 py-1.5 text-sm`}
                  >
                    {selectedCamera.status === 'active' ? (
                      <>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <Wifi className="w-3 h-3" />
                        <span className="font-semibold">LIVE</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3" />
                        <span className="font-semibold">OFFLINE</span>
                      </>
                    )}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closeLiveView}
                    className="bg-white/10 hover:bg-white/20 border-white/30 text-white hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 bg-black">
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-black relative">
                {/* Note: Browsers cannot directly play RTSP streams.
                    You need a backend service to convert RTSP to HLS/WebRTC/WebSocket.
                    For now, showing a placeholder with camera info. */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white max-w-2xl px-6">
                    <div className="mb-6">
                      <div className="inline-flex p-6 bg-white/5 backdrop-blur-sm rounded-full mb-4">
                        <Camera className="w-20 h-20 text-white opacity-60" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{selectedCamera.placeName}</h3>
                    <p className="text-gray-300 mb-6">Live CCTV Feed</p>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
                      <p className="text-xs text-gray-300 mb-3 font-semibold uppercase tracking-wide">RTSP Stream URL</p>
                      <p className="text-sm font-mono break-all text-white bg-black/30 p-3 rounded-lg">
                        {selectedCamera.rtspLink}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400 mb-6">
                      <div className="flex items-center gap-1.5 bg-white/5 px-3 py-2 rounded-lg">
                        <MapPin className="w-3 h-3" />
                        <span className="font-mono">
                          {selectedCamera.latitude.toFixed(6)}, {selectedCamera.longitude.toFixed(6)}
                        </span>
                      </div>
                      {selectedCamera.lastStatusCheck && (
                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-2 rounded-lg">
                          <RefreshCw className="w-3 h-3" />
                          <span>Last checked: {formatDate(selectedCamera.lastStatusCheck)}</span>
                        </div>
                      )}
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <p className="text-xs text-blue-300 leading-relaxed">
                        <strong>Note:</strong> RTSP streams require a backend service to convert to web-compatible format (HLS/WebRTC).
                        The stream will be displayed here once the backend service is configured.
                      </p>
                    </div>
                  </div>
                </div>
                {selectedCamera.status === 'active' && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-2xl border-2 border-red-400">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    LIVE STREAMING
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

export default CrowdControl;
