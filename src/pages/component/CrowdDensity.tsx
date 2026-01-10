import {
    Activity,
    AlertTriangle,
    BarChart3,
    Clock,
    Filter,
    MapPin,
    RefreshCw,
    TrendingDown,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
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
}

interface DensityData {
  cameraId: string;
  placeName: string;
  currentDensity: number;
  densityLevel: 'low' | 'medium' | 'high' | 'critical';
  densityPercentage: number;
  peopleCount: number;
  maxCapacity: number;
  peakDensity: number;
  averageDensity: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  lastHourChange: number;
  status: 'active' | 'inactive';
  coordinates: { lat: number; lng: number };
}

const CrowdDensity = () => {
  const [cameras, setCameras] = useState<CCTV[]>([]);
  const [densityData, setDensityData] = useState<Map<string, DensityData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [filterDensity, setFilterDensity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
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

  // Generate density data (In production, this would come from your AI/ML backend)
  useEffect(() => {
    if (cameras.length === 0) return;

    const updateDensityData = () => {
      const newDensityData = new Map<string, DensityData>();
      
      cameras.forEach(camera => {
        if (camera.id && camera.status === 'active') {
          // Simulate density data - In production, fetch from your analytics API
          const peopleCount = Math.floor(Math.random() * 800) + 50;
          const maxCapacity = 1000;
          const densityPercentage = Math.min(100, (peopleCount / maxCapacity) * 100);
          
          let densityLevel: 'low' | 'medium' | 'high' | 'critical';
          if (densityPercentage < 30) densityLevel = 'low';
          else if (densityPercentage < 60) densityLevel = 'medium';
          else if (densityPercentage < 85) densityLevel = 'high';
          else densityLevel = 'critical';

          const trends: ('increasing' | 'decreasing' | 'stable')[] = ['increasing', 'decreasing', 'stable'];
          const trend = trends[Math.floor(Math.random() * trends.length)];
          const lastHourChange = Math.floor(Math.random() * 20) - 10; // -10 to +10

          newDensityData.set(camera.id, {
            cameraId: camera.id,
            placeName: camera.placeName,
            currentDensity: densityPercentage,
            densityLevel,
            densityPercentage,
            peopleCount,
            maxCapacity,
            peakDensity: Math.min(100, densityPercentage + Math.random() * 15),
            averageDensity: Math.max(0, densityPercentage - Math.random() * 20),
            trend,
            lastHourChange,
            status: camera.status,
            coordinates: {
              lat: camera.latitude,
              lng: camera.longitude
            }
          });
        }
      });

      setDensityData(newDensityData);
    };

    // Initial update
    updateDensityData();

    // Auto-refresh every 5 seconds if enabled
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(updateDensityData, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cameras, autoRefresh]);

  const getDensityColor = (level: string) => {
    switch (level) {
      case 'low': return { bg: 'bg-green-600', text: 'text-green-700', border: 'border-green-300', light: 'bg-green-50' };
      case 'medium': return { bg: 'bg-yellow-600', text: 'text-yellow-700', border: 'border-yellow-300', light: 'bg-yellow-50' };
      case 'high': return { bg: 'bg-orange-600', text: 'text-orange-700', border: 'border-orange-300', light: 'bg-orange-50' };
      case 'critical': return { bg: 'bg-red-600', text: 'text-red-700', border: 'border-red-300', light: 'bg-red-50' };
      default: return { bg: 'bg-gray-600', text: 'text-gray-700', border: 'border-gray-300', light: 'bg-gray-50' };
    }
  };

  const getDensityLabel = (level: string) => {
    switch (level) {
      case 'low': return 'Low Density';
      case 'medium': return 'Medium Density';
      case 'high': return 'High Density';
      case 'critical': return 'Critical Density';
      default: return 'Unknown';
    }
  };

  const filteredDensityData = Array.from(densityData.values()).filter(data => {
    if (filterDensity === 'all') return true;
    return data.densityLevel === filterDensity;
  });

  const totalPeople = Array.from(densityData.values()).reduce((sum, d) => sum + d.peopleCount, 0);
  const averageDensity = densityData.size > 0 
    ? Array.from(densityData.values()).reduce((sum, d) => sum + d.densityPercentage, 0) / densityData.size 
    : 0;
  const criticalAreas = Array.from(densityData.values()).filter(d => d.densityLevel === 'critical').length;
  const highDensityAreas = Array.from(densityData.values()).filter(d => d.densityLevel === 'high' || d.densityLevel === 'critical').length;

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
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crowd Density Analysis</h1>
              <p className="text-gray-500 mt-1">Comprehensive crowd density monitoring and analysis</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Total People</p>
                <p className="text-3xl font-bold text-gray-900">{totalPeople.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Across all locations</p>
              </div>
              <div className="p-3 bg-blue-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Average Density</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(averageDensity)}%</p>
                <p className="text-xs text-gray-500 mt-1">Overall capacity utilization</p>
              </div>
              <div className="p-3 bg-purple-600 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">High Density Areas</p>
                <p className="text-3xl font-bold text-gray-900">{highDensityAreas}</p>
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
                <p className="text-3xl font-bold text-gray-900">{criticalAreas}</p>
                <p className="text-xs text-gray-500 mt-1">Immediate action needed</p>
              </div>
              <div className="p-3 bg-red-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <CardTitle className="text-lg">Filters & Time Range</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Density Level:</span>
              <div className="flex gap-2">
                <Button
                  variant={filterDensity === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterDensity('all')}
                  className={filterDensity === 'all' ? 'bg-gray-900 hover:bg-gray-800 text-white' : ''}
                >
                  All
                </Button>
                <Button
                  variant={filterDensity === 'low' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterDensity('low')}
                  className={filterDensity === 'low' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                >
                  Low
                </Button>
                <Button
                  variant={filterDensity === 'medium' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterDensity('medium')}
                  className={filterDensity === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : ''}
                >
                  Medium
                </Button>
                <Button
                  variant={filterDensity === 'high' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterDensity('high')}
                  className={filterDensity === 'high' ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}
                >
                  High
                </Button>
                <Button
                  variant={filterDensity === 'critical' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterDensity('critical')}
                  className={filterDensity === 'critical' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                >
                  Critical
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm font-semibold text-gray-700">Time Range:</span>
              <div className="flex gap-2 border border-gray-200 rounded-lg p-1">
                {(['1h', '6h', '24h', '7d'] as const).map((range) => (
                  <Button
                    key={range}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTimeRange(range)}
                    className={`${
                      selectedTimeRange === range 
                        ? 'bg-gray-900 text-white hover:bg-gray-800' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {range === '1h' ? '1 Hour' : range === '6h' ? '6 Hours' : range === '24h' ? '24 Hours' : '7 Days'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Density Overview Cards */}
      {filteredDensityData.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-lg">No density data available</p>
              <p className="text-sm text-gray-400 mt-2">
                {filterDensity === 'all' 
                  ? 'No active cameras found. Add cameras from CCTV Management.'
                  : `No ${filterDensity} density areas found.`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDensityData.map((data) => {
            const colors = getDensityColor(data.densityLevel);
            
            return (
              <Card 
                key={data.cameraId} 
                className={`hover:shadow-xl transition-all duration-300 ${
                  data.densityLevel === 'critical' 
                    ? 'border-red-300 bg-red-50/30' 
                    : data.densityLevel === 'high'
                    ? 'border-orange-300 bg-orange-50/30'
                    : data.densityLevel === 'medium'
                    ? 'border-yellow-300 bg-yellow-50/30'
                    : 'border-green-300 bg-green-50/30'
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${colors.light}`}>
                        <MapPin className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl truncate">{data.placeName}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-xs">
                            {data.coordinates.lat.toFixed(6)}, {data.coordinates.lng.toFixed(6)}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant="default"
                      className={`${colors.bg} text-white flex items-center gap-1.5 px-3 py-1`}
                    >
                      {getDensityLabel(data.densityLevel)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* Main Density Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                      <p className="text-xs font-medium text-gray-600 mb-1">Current</p>
                      <p className="text-2xl font-bold text-gray-900">{data.densityPercentage}%</p>
                      <p className="text-xs text-gray-500 mt-1">Density</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                      <p className="text-xs font-medium text-gray-600 mb-1">Peak</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.round(data.peakDensity)}%</p>
                      <p className="text-xs text-gray-500 mt-1">Today</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                      <p className="text-xs font-medium text-gray-600 mb-1">Average</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.round(data.averageDensity)}%</p>
                      <p className="text-xs text-gray-500 mt-1">24h Avg</p>
                    </div>
                  </div>

                  {/* People Count */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-xs font-medium text-gray-600">People Count</p>
                          <p className="text-2xl font-bold text-gray-900">{data.peopleCount}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Capacity</p>
                        <p className="text-lg font-semibold text-gray-900">{data.maxCapacity}</p>
                      </div>
                    </div>
                  </div>

                  {/* Density Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700">Density Level</p>
                      <p className="text-sm font-bold text-gray-900">{data.densityPercentage}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 ${colors.bg}`}
                        style={{ width: `${data.densityPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Trend and Change */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg border ${
                      data.trend === 'increasing' 
                        ? 'bg-red-50 border-red-200' 
                        : data.trend === 'decreasing'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {data.trend === 'increasing' ? (
                          <TrendingUp className="w-4 h-4 text-red-600" />
                        ) : data.trend === 'decreasing' ? (
                          <TrendingDown className="w-4 h-4 text-green-600" />
                        ) : (
                          <Activity className="w-4 h-4 text-gray-600" />
                        )}
                        <p className="text-xs font-medium text-gray-600">Trend</p>
                      </div>
                      <p className={`text-sm font-semibold capitalize ${
                        data.trend === 'increasing' ? 'text-red-700' : data.trend === 'decreasing' ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        {data.trend}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg border ${
                      data.lastHourChange > 0 
                        ? 'bg-red-50 border-red-200' 
                        : data.lastHourChange < 0
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <p className="text-xs font-medium text-gray-600">Last Hour</p>
                      </div>
                      <p className={`text-sm font-semibold ${
                        data.lastHourChange > 0 ? 'text-red-700' : data.lastHourChange < 0 ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        {data.lastHourChange > 0 ? '+' : ''}{data.lastHourChange}%
                      </p>
                    </div>
                  </div>

                  {/* Capacity Warning */}
                  {data.densityPercentage >= 85 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <p className="text-xs font-semibold text-red-700">
                          Capacity limit approaching! Consider crowd management measures.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        data.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      }`}></div>
                      <span>{data.status === 'active' ? 'Camera Online' : 'Camera Offline'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Updated: {new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Density Distribution Chart */}
      {densityData.size > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <CardTitle>Density Distribution</CardTitle>
            </div>
            <CardDescription>Distribution of crowd density across all monitored locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(['low', 'medium', 'high', 'critical'] as const).map((level) => {
                const count = Array.from(densityData.values()).filter(d => d.densityLevel === level).length;
                const percentage = densityData.size > 0 ? (count / densityData.size) * 100 : 0;
                const colors = getDensityColor(level);
                
                return (
                  <div key={level} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colors.bg}`}></div>
                        <span className="text-sm font-semibold text-gray-700">{getDensityLabel(level)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{count} locations</span>
                        <span className="text-sm font-bold text-gray-900">{Math.round(percentage)}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${colors.bg}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CrowdDensity;
