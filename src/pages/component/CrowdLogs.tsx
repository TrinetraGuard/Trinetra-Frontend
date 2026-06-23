import {
  BarChart3,
  Calendar,
  Clock,
  Download,
  FileText,
  Filter,
  MapPin,
  RefreshCw,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CctvStreamRelayBanner } from '@/components/cctvcrowd/CctvStreamRelayBanner';
import { useCrowdLogHistory } from '@/hooks/useCrowdLogHistory';
import { useCctvCameras } from '@/hooks/useCctvCameras';
import { useLiveCrowdAnalytics } from '@/hooks/useLiveCrowdAnalytics';
import { admin } from '@/lib/adminTheme';
import { filterLogsByDateRange } from '@/lib/crowdAnalyticsStore';
import { buildCameraLogSummaries, exportCrowdLogsCsv } from '@/lib/crowdReports';
import type { CrowdDateRange } from '@/types/crowdReports';

const CrowdLogs = () => {
  const { cameras, loading } = useCctvCameras();
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<CrowdDateRange>('week');

  const { scanning, lastScanAt, configError, rescan } = useLiveCrowdAnalytics(cameras, true);
  const allLogs = useCrowdLogHistory();

  const filteredLogs = useMemo(() => {
    const ranged = filterLogsByDateRange(allLogs, dateRange);
    if (!selectedCamera) return ranged;
    return ranged.filter((entry) => entry.cameraId === selectedCamera);
  }, [allLogs, dateRange, selectedCamera]);

  const summaries = useMemo(
    () => buildCameraLogSummaries(cameras, allLogs, dateRange),
    [allLogs, cameras, dateRange]
  );

  const filteredSummaries = selectedCamera
    ? summaries.filter((summary) => summary.cameraId === selectedCamera)
    : summaries;

  const totalLogs = filteredLogs.length;
  const totalVisits = filteredSummaries.reduce((sum, summary) => sum + summary.totalVisits, 0);
  const averagePeople =
    filteredSummaries.length > 0
      ? filteredSummaries.reduce((sum, summary) => sum + summary.averagePeople, 0) /
        filteredSummaries.length
      : 0;

  const handleExport = () => {
    const csv = exportCrowdLogsCsv(filteredLogs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crowd-logs-${dateRange}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
            <div className={`p-2 rounded-lg ${admin.iconWrap}`}>
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crowd Logs</h1>
              <p className="text-gray-500 mt-1">Recorded crowd scans from live CCTV analytics</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => void rescan()} disabled={scanning}>
            <RefreshCw className={`w-4 h-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning…' : 'Scan now'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredLogs.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Log Entries</p>
                <p className="text-3xl font-bold text-gray-900">{totalLogs.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Historical records</p>
              </div>
              <div className={`p-3 rounded-lg ${admin.statIcon}`}>
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Visits</p>
                <p className="text-3xl font-bold text-gray-900">{totalVisits.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Across all locations</p>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Average People</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(averagePeople)}</p>
                <p className="text-xs text-gray-500 mt-1">Per location</p>
              </div>
              <div className="p-3 bg-gray-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
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
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Date Range:</span>
              <div className="flex gap-2">
                {(['today', 'week', 'month', 'all'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={dateRange === range ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRange(range)}
                    className={dateRange === range ? 'bg-gray-900 hover:bg-gray-800 text-white' : ''}
                  >
                    {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'All Time'}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Camera:</span>
              <select
                value={selectedCamera || 'all'}
                onChange={(e) => setSelectedCamera(e.target.value === 'all' ? null : e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="all">All Cameras</option>
                {cameras.map((camera) => {
                  const key = camera.id ?? camera.placeName;
                  return (
                    <option key={key} value={key}>
                      {camera.placeName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera Log Summaries */}
      {filteredSummaries.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-lg">No log data available</p>
              <p className="text-sm text-gray-400 mt-2">
                Logs are created automatically each time live analytics scans a camera. Run a scan and check back shortly.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredSummaries.map((summary) => (
            <Card key={summary.cameraId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${admin.iconWrap}`}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{summary.placeName}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs">
                          {summary.coordinates.lat.toFixed(6)}, {summary.coordinates.lng.toFixed(6)}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${admin.badge}`}>
                    {summary.totalVisits} Records
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">Average People</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.averagePeople}</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">Peak People</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.peakPeople}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">Peak Time</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.peakTime}</p>
                    <p className="text-xs text-gray-500 mt-1">Most crowded</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">Quiet Time</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.quietTime}</p>
                    <p className="text-xs text-gray-500 mt-1">Least crowded</p>
                  </div>
                </div>

                {/* Busiest Day */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-700" />
                    <p className="text-sm font-semibold text-gray-700">Busiest Day</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{summary.busiestDay}</p>
                  <p className="text-xs text-gray-500 mt-1">Day with highest average crowd</p>
                </div>

                {/* Time Slot Analysis */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <CardTitle className="text-lg">Hourly Analysis</CardTitle>
                    <CardDescription>Average crowd levels by time of day</CardDescription>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {summary.timeSlots.map((slot) => (
                      <div key={slot.hour} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-2">{slot.label}</p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Avg People:</span>
                            <span className="text-sm font-bold text-gray-900">{slot.averagePeople}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Peak:</span>
                            <span className="text-sm font-semibold text-gray-900">{slot.peakPeople}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-gray-800 h-2 rounded-full transition-all"
                              style={{ width: `${slot.averageDensity}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{slot.averageDensity}% density</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Slot Chart */}
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-4">Crowd Pattern Visualization</p>
                  <div className="flex items-end gap-2 h-48">
                    {summary.timeSlots.map((slot) => {
                      const maxHeight = Math.max(...summary.timeSlots.map(s => s.averagePeople));
                      const height = (slot.averagePeople / maxHeight) * 100;
                      
                      return (
                        <div key={slot.hour} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-gradient-to-t from-gray-900 to-gray-500 rounded-t transition-all hover:from-black hover:to-gray-600"
                            style={{ height: `${height}%` }}
                            title={`${slot.label}: ${slot.averagePeople} people`}
                          ></div>
                          <p className="text-xs text-gray-600 mt-2">{slot.hour}:00</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CrowdLogs;
