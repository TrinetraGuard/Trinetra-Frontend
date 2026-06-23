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
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CctvStreamRelayBanner } from '@/components/cctvcrowd/CctvStreamRelayBanner';
import { useCrowdLogHistory } from '@/hooks/useCrowdLogHistory';
import { useCctvCameras } from '@/hooks/useCctvCameras';
import { useLiveCrowdAnalytics } from '@/hooks/useLiveCrowdAnalytics';
import { admin, densityStyles, type DensityLevel } from '@/lib/adminTheme';
import { buildDensityReports } from '@/lib/crowdReports';
import type { CrowdTimeWindow } from '@/types/crowdReports';

const CrowdDensity = () => {
  const { cameras, loading } = useCctvCameras();
  const [selectedTimeRange, setSelectedTimeRange] = useState<CrowdTimeWindow>('24h');
  const [filterDensity, setFilterDensity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { analytics, scanning, lastScanAt, configError, rescan } = useLiveCrowdAnalytics(
    cameras,
    autoRefresh
  );
  const logs = useCrowdLogHistory();

  const densityData = useMemo(
    () => buildDensityReports(cameras, analytics, logs, selectedTimeRange),
    [analytics, cameras, logs, selectedTimeRange]
  );

  const getDensityColor = (level: DensityLevel) => densityStyles(level);

  const densityFilterActiveClass: Record<DensityLevel, string> = {
    low: 'bg-gray-400 hover:bg-gray-500 text-white',
    medium: 'bg-gray-600 hover:bg-gray-700 text-white',
    high: 'bg-gray-800 hover:bg-gray-900 text-white',
    critical: 'bg-black hover:bg-gray-900 text-white',
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

  const filteredDensityData = densityData.filter((data) => {
    if (filterDensity === 'all') return true;
    return data.densityLevel === filterDensity;
  });

  const detectedRows = densityData.filter((item) => item.detectionAvailable);
  const totalPeople = detectedRows.reduce((sum, item) => sum + item.peopleCount, 0);
  const averageDensity =
    detectedRows.length > 0
      ? detectedRows.reduce((sum, item) => sum + item.densityPercentage, 0) / detectedRows.length
      : 0;
  const criticalAreas = detectedRows.filter((item) => item.densityLevel === 'critical').length;
  const highDensityAreas = detectedRows.filter(
    (item) => item.densityLevel === 'high' || item.densityLevel === 'critical'
  ).length;

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
            <div className={`p-2 rounded-lg ${admin.iconWrap}`}>
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crowd Density Analysis</h1>
              <p className="text-gray-500 mt-1">Live density from CCTV snapshots and recorded scan history</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => void rescan()} disabled={scanning}>
            <RefreshCw className={`w-4 h-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning…' : 'Scan now'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-gray-100 border-gray-300 text-gray-800' : ''}
          >
            {autoRefresh ? 'Auto refresh ON' : 'Auto refresh OFF'}
          </Button>
        </div>
      </div>

      <CctvStreamRelayBanner />

      {configError && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4 text-sm text-amber-900">{configError}</CardContent>
        </Card>
      )}

      {lastScanAt && (
        <p className="text-xs text-gray-500">
          Last live scan: {lastScanAt.toLocaleTimeString()}
          {scanning ? ' · scan in progress…' : ''}
        </p>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total People</p>
                <p className="text-3xl font-bold text-gray-900">{totalPeople.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Across all locations</p>
              </div>
              <div className={`p-3 rounded-lg ${admin.statIcon}`}>
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Average Density</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(averageDensity)}%</p>
                <p className="text-xs text-gray-500 mt-1">Overall capacity utilization</p>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">High Density Areas</p>
                <p className="text-3xl font-bold text-gray-900">{highDensityAreas}</p>
                <p className="text-xs text-gray-500 mt-1">Requiring attention</p>
              </div>
              <div className="p-3 bg-gray-600 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Critical Zones</p>
                <p className="text-3xl font-bold text-gray-900">{criticalAreas}</p>
                <p className="text-xs text-gray-500 mt-1">Immediate action needed</p>
              </div>
              <div className="p-3 bg-black rounded-lg">
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
                {(['low', 'medium', 'high', 'critical'] as const).map((level) => (
                  <Button
                    key={level}
                    variant={filterDensity === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterDensity(level)}
                    className={filterDensity === level ? densityFilterActiveClass[level] : ''}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
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
                className={`hover:shadow-xl transition-all duration-300 border ${getDensityColor(data.densityLevel).border} ${getDensityColor(data.densityLevel).light}`}
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
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-700" />
                        <div>
                          <p className="text-xs font-medium text-gray-600">People Count</p>
                          <p className="text-2xl font-bold text-gray-900">
                        {data.detectionAvailable ? data.peopleCount : '—'}
                      </p>
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
                    <div className="p-3 rounded-lg border bg-gray-50 border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        {data.trend === 'increasing' ? (
                          <TrendingUp className="w-4 h-4 text-gray-800" />
                        ) : data.trend === 'decreasing' ? (
                          <TrendingDown className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Activity className="w-4 h-4 text-gray-600" />
                        )}
                        <p className="text-xs font-medium text-gray-600">Trend</p>
                      </div>
                      <p className="text-sm font-semibold capitalize text-gray-900">
                        {data.trend}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border bg-gray-50 border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <p className="text-xs font-medium text-gray-600">Last Hour</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {data.lastHourChange > 0 ? '+' : ''}{data.lastHourChange}%
                      </p>
                    </div>
                  </div>

                  {/* Capacity Warning */}
                  {data.densityPercentage >= 85 && (
                    <div className="p-3 bg-gray-200 border border-gray-400 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-gray-800" />
                        <p className="text-xs font-semibold text-gray-900">
                          Capacity limit approaching! Consider crowd management measures.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        data.status === 'active' ? 'bg-gray-800 animate-pulse' : 'bg-gray-400'
                      }`}></div>
                      <span>{data.status === 'active' ? 'Camera Online' : 'Camera Offline'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Updated: {data.lastUpdate.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Density Distribution Chart */}
      {densityData.length > 0 && (
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
                const count = densityData.filter((item) => item.densityLevel === level).length;
                const percentage = densityData.length > 0 ? (count / densityData.length) * 100 : 0;
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
