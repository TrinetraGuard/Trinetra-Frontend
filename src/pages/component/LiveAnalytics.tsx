import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity, 
  BarChart3,
  MapPin,
  Wifi,
  WifiOff,
  RefreshCw,
  Eye,
  Zap,
  X
} from 'lucide-react';
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

interface CameraAnalytics {
  cameraId: string;
  placeName: string;
  totalPeople: number;
  crowdDensity: 'low' | 'medium' | 'high' | 'critical';
  densityPercentage: number;
  maxCapacity: number;
  highCrowdAreas: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  lastUpdate: Date;
  status: 'active' | 'inactive';
}

const LiveAnalytics = () => {
  const [cameras, setCameras] = useState<CCTV[]>([]);
  const [analytics, setAnalytics] = useState<Map<string, CameraAnalytics>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

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

  // Simulate analytics data (In production, this would come from your AI/ML backend)
  useEffect(() => {
    if (cameras.length === 0) return;

    const updateAnalytics = () => {
      const newAnalytics = new Map<string, CameraAnalytics>();
      
      cameras.forEach(camera => {
        if (camera.id) {
          // Simulate analytics data - In production, fetch from your analytics API
          const basePeople = Math.floor(Math.random() * 500) + 50;
          const densityPercentage = Math.min(100, (basePeople / 1000) * 100);
          
          let crowdDensity: 'low' | 'medium' | 'high' | 'critical';
          if (densityPercentage < 30) crowdDensity = 'low';
          else if (densityPercentage < 60) crowdDensity = 'medium';
          else if (densityPercentage < 85) crowdDensity = 'high';
          else crowdDensity = 'critical';

          const trends: ('increasing' | 'decreasing' | 'stable')[] = ['increasing', 'decreasing', 'stable'];
          const trend = trends[Math.floor(Math.random() * trends.length)];

          newAnalytics.set(camera.id, {
            cameraId: camera.id,
            placeName: camera.placeName,
            totalPeople: basePeople,
            crowdDensity,
            densityPercentage: Math.round(densityPercentage),
            maxCapacity: 1000,
            highCrowdAreas: crowdDensity === 'high' || crowdDensity === 'critical' ? Math.floor(Math.random() * 5) + 1 : 0,
            trend,
            lastUpdate: new Date(),
            status: camera.status,
          });
        }
      });

      setAnalytics(newAnalytics);
    };

    // Initial update
    updateAnalytics();

    // Auto-refresh every 5 seconds if enabled
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(updateAnalytics, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cameras, autoRefresh]);

  const getDensityColor = (density: string) => {
    switch (density) {
      case 'low': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'high': return 'bg-orange-600';
      case 'critical': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getDensityText = (density: string) => {
    switch (density) {
      case 'low': return 'Low';
      case 'medium': return 'Medium';
      case 'high': return 'High';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const totalPeople = Array.from(analytics.values()).reduce((sum, a) => sum + a.totalPeople, 0);
  const activeCameras = cameras.filter(c => c.status === 'active').length;
  const criticalCameras = Array.from(analytics.values()).filter(a => a.crowdDensity === 'critical').length;
  const highDensityCameras = Array.from(analytics.values()).filter(a => a.crowdDensity === 'high' || a.crowdDensity === 'critical').length;

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
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Live Analytics</h1>
              <p className="text-gray-500 mt-1">Real-time crowd analysis and density monitoring</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200 text-green-700' : ''}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total People Detected</p>
                <p className="text-3xl font-bold text-gray-900">{totalPeople.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Across all cameras</p>
              </div>
              <div className="p-3 bg-blue-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Cameras</p>
                <p className="text-3xl font-bold text-gray-900">{activeCameras}</p>
                <p className="text-xs text-gray-500 mt-1">Out of {cameras.length} total</p>
              </div>
              <div className="p-3 bg-green-600 rounded-lg">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">High Density Areas</p>
                <p className="text-3xl font-bold text-gray-900">{highDensityCameras}</p>
                <p className="text-xs text-gray-500 mt-1">Requiring attention</p>
              </div>
              <div className="p-3 bg-orange-600 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Critical Zones</p>
                <p className="text-3xl font-bold text-gray-900">{criticalCameras}</p>
                <p className="text-xs text-gray-500 mt-1">Immediate action needed</p>
              </div>
              <div className="p-3 bg-red-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Analytics Grid */}
      {cameras.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-lg">No cameras available</p>
              <p className="text-sm text-gray-400 mt-2">
                Add cameras from CCTV Management to see analytics
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cameras.map((camera) => {
            const cameraAnalytics = analytics.get(camera.id || '');
            if (!cameraAnalytics) return null;

            return (
              <Card 
                key={camera.id} 
                className={`hover:shadow-lg transition-all duration-200 ${
                  cameraAnalytics.crowdDensity === 'critical' 
                    ? 'border-red-300 bg-red-50/30' 
                    : cameraAnalytics.crowdDensity === 'high'
                    ? 'border-orange-300 bg-orange-50/30'
                    : 'border-gray-200'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        camera.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {camera.status === 'active' ? (
                          <Wifi className="w-5 h-5 text-green-600" />
                        ) : (
                          <WifiOff className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl truncate">{camera.placeName}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span className="font-mono text-xs">
                            {camera.latitude.toFixed(6)}, {camera.longitude.toFixed(6)}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant="default"
                      className={`${getDensityColor(cameraAnalytics.crowdDensity)} text-white flex items-center gap-1.5`}
                    >
                      {getDensityText(cameraAnalytics.crowdDensity)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* People Count */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <p className="text-xs font-medium text-gray-600">Total People</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{cameraAnalytics.totalPeople}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Max: {cameraAnalytics.maxCapacity}
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                        <p className="text-xs font-medium text-gray-600">Density</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{cameraAnalytics.densityPercentage}%</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getDensityColor(cameraAnalytics.crowdDensity)}`}
                          style={{ width: `${cameraAnalytics.densityPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Trend and High Crowd Areas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        {getTrendIcon(cameraAnalytics.trend)}
                        <p className="text-xs font-medium text-gray-600">Trend</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 capitalize">
                        {cameraAnalytics.trend}
                      </p>
                    </div>

                    <div className={`p-3 rounded-lg border ${
                      cameraAnalytics.highCrowdAreas > 0
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className={`w-4 h-4 ${
                          cameraAnalytics.highCrowdAreas > 0 ? 'text-orange-600' : 'text-gray-400'
                        }`} />
                        <p className="text-xs font-medium text-gray-600">High Crowd Areas</p>
                      </div>
                      <p className={`text-sm font-semibold ${
                        cameraAnalytics.highCrowdAreas > 0 ? 'text-orange-700' : 'text-gray-700'
                      }`}>
                        {cameraAnalytics.highCrowdAreas} {cameraAnalytics.highCrowdAreas === 1 ? 'area' : 'areas'}
                      </p>
                    </div>
                  </div>

                  {/* Capacity Indicator */}
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-700">Capacity Utilization</p>
                      <p className="text-xs font-bold text-gray-900">
                        {cameraAnalytics.totalPeople}/{cameraAnalytics.maxCapacity}
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${getDensityColor(cameraAnalytics.crowdDensity)}`}
                        style={{ width: `${cameraAnalytics.densityPercentage}%` }}
                      ></div>
                    </div>
                    {cameraAnalytics.densityPercentage >= 85 && (
                      <p className="text-xs text-red-600 font-medium mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Capacity limit approaching!
                      </p>
                    )}
                  </div>

                  {/* Status and Last Update */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      {camera.status === 'active' ? (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>Camera Online</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <WifiOff className="w-3 h-3" />
                          <span>Camera Offline</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      <span>
                        Updated: {cameraAnalytics.lastUpdate.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detailed View for Selected Camera */}
      {selectedCamera && analytics.has(selectedCamera) && (
        <Card className="border-2 border-blue-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                Detailed Analytics - {analytics.get(selectedCamera)?.placeName}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCamera(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Detailed analytics view can be expanded here */}
            <p className="text-gray-600">Detailed analytics view coming soon...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveAnalytics;
