import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, Video, Wifi, WifiOff, Maximize2, RefreshCw, Grid, List } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crowd Monitoring</h1>
          <p className="text-gray-500 mt-1">Real-time monitoring of all CCTV cameras for crowd management</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">{activeCameras} Active</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <WifiOff className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{inactiveCameras} Offline</span>
          </div>
        </div>
      </div>

      {/* Filters and View Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                  className={filterStatus === 'all' ? 'bg-gray-900 hover:bg-gray-800' : ''}
                >
                  All ({cameras.length})
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('active')}
                  className={filterStatus === 'active' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  Active ({activeCameras})
                </Button>
                <Button
                  variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('inactive')}
                  className={filterStatus === 'inactive' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                >
                  Offline ({inactiveCameras})
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">View:</span>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-gray-900 hover:bg-gray-800' : ''}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-gray-900 hover:bg-gray-800' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
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
              className="hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              <div className="relative">
                {/* Camera Feed Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="w-16 h-16 text-gray-600 opacity-50" />
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant={camera.status === 'active' ? 'default' : 'outline'}
                      className={`${
                        camera.status === 'active' 
                          ? 'bg-green-600 border-green-600' 
                          : 'bg-gray-600 border-gray-600'
                      } flex items-center gap-1.5`}
                    >
                      {camera.status === 'active' ? (
                        <>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <Wifi className="w-3 h-3" />
                          Online
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-3 h-3" />
                          Offline
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Camera Name Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white font-semibold text-lg">{camera.placeName}</p>
                  </div>

                  {/* View Button */}
                  <div className="absolute top-3 right-3">
                    <Button
                      size="sm"
                      onClick={() => handleViewLive(camera)}
                      className="bg-white/90 hover:bg-white text-gray-900 shadow-lg"
                      disabled={camera.status === 'inactive'}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="font-mono text-xs">
                      {camera.latitude.toFixed(6)}, {camera.longitude.toFixed(6)}
                    </span>
                  </div>
                  
                  {camera.lastStatusCheck && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <RefreshCw className="w-3 h-3" />
                      <span>Last checked: {formatDate(camera.lastStatusCheck)}</span>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleViewLive(camera)}
                    disabled={camera.status === 'inactive'}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    View Live Feed
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCameras.map((camera) => (
            <Card key={camera.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {/* Camera Preview */}
                  <div className="relative w-64 h-36 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex-shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-600 opacity-50" />
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant={camera.status === 'active' ? 'default' : 'outline'}
                        className={`${
                          camera.status === 'active' 
                            ? 'bg-green-600' 
                            : 'bg-gray-600'
                        } text-xs`}
                      >
                        {camera.status === 'active' ? (
                          <>
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1"></div>
                            Online
                          </>
                        ) : (
                          'Offline'
                        )}
                      </Badge>
                    </div>
                  </div>

                  {/* Camera Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{camera.placeName}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            <span className="font-mono text-xs">
                              {camera.latitude.toFixed(6)}, {camera.longitude.toFixed(6)}
                            </span>
                          </div>
                          {camera.lastStatusCheck && (
                            <div className="flex items-center gap-1.5">
                              <RefreshCw className="w-4 h-4" />
                              <span>Checked: {formatDate(camera.lastStatusCheck)}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 font-medium mb-1">RTSP Link</p>
                          <p className="text-sm font-mono text-gray-900 truncate">{camera.rtspLink}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewLive(camera)}
                        disabled={camera.status === 'inactive'}
                        className="ml-4"
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
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeLiveView}
        >
          <Card
            className="max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-white">{selectedCamera.placeName} - Live Feed</CardTitle>
                  <CardDescription className="text-gray-300 flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4" />
                    {selectedCamera.latitude.toFixed(6)}, {selectedCamera.longitude.toFixed(6)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={selectedCamera.status === 'active' ? 'default' : 'outline'}
                    className={`${
                      selectedCamera.status === 'active' 
                        ? 'bg-green-600' 
                        : 'bg-gray-600'
                    } flex items-center gap-1.5`}
                  >
                    {selectedCamera.status === 'active' ? (
                      <>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <Wifi className="w-3 h-3" />
                        LIVE
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3" />
                        OFFLINE
                      </>
                    )}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closeLiveView}
                    className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="aspect-video bg-black relative">
                {/* Note: Browsers cannot directly play RTSP streams.
                    You need a backend service to convert RTSP to HLS/WebRTC/WebSocket.
                    For now, showing a placeholder with camera info. */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Camera className="w-20 h-20 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-semibold mb-2">Live CCTV Feed</p>
                    <p className="text-sm text-gray-300 mb-4">{selectedCamera.placeName}</p>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-lg mx-auto mb-4">
                      <p className="text-xs text-gray-300 mb-2 font-medium">RTSP Stream URL:</p>
                      <p className="text-sm font-mono break-all text-white">{selectedCamera.rtspLink}</p>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {selectedCamera.latitude.toFixed(6)}, {selectedCamera.longitude.toFixed(6)}
                        </span>
                      </div>
                      {selectedCamera.lastStatusCheck && (
                        <div className="flex items-center gap-1.5">
                          <RefreshCw className="w-3 h-3" />
                          <span>Last checked: {formatDate(selectedCamera.lastStatusCheck)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-6 max-w-md mx-auto">
                      Note: RTSP streams require a backend service to convert to web-compatible format (HLS/WebRTC).
                      The stream will be displayed here once the backend service is configured.
                    </p>
                  </div>
                </div>
                {selectedCamera.status === 'active' && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
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

export default CrowdControl;
