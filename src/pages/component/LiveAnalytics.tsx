import {
  Activity,
  AlertTriangle,
  BarChart3,
  Camera,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { admin, densityStyles, type DensityLevel } from '@/lib/adminTheme';
import { useTrinetraAnalytics } from '@/hooks/useTrinetraAnalytics';

const densityLabel: Record<DensityLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const LiveAnalytics = () => {
  const { cameras, summary, loading, error, wsConnected, lastUpdate, refresh } =
    useTrinetraAnalytics();

  const sortedCameras = [...cameras].sort((a, b) => a.channel - b.channel);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${admin.iconWrap}`}>
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Analytics</h1>
            <p className="mt-1 text-gray-500">
              Real-time YOLO crowd detection — {cameras.length} cameras
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* WS connection badge */}
          <Badge
            className={wsConnected ? 'bg-emerald-600 text-white' : 'bg-gray-400 text-white'}
          >
            {wsConnected ? (
              <><Wifi className="mr-1 h-3 w-3" /> Live</>
            ) : (
              <><WifiOff className="mr-1 h-3 w-3" /> Polling</>
            )}
          </Badge>
          <Button size="sm" variant="outline" onClick={() => void refresh()}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠ {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">People on site</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{summary.total_people}</p>
          </CardContent>
        </Card>
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Cameras live</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {summary.active_cameras}/{summary.total_cameras || 8}
            </p>
          </CardContent>
        </Card>
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">High density</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-gray-900">
              {summary.high_density_count}
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </p>
          </CardContent>
        </Card>
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Critical</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-gray-900">
              {summary.critical_count}
              <Zap className="h-5 w-5 text-red-500" />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Camera table */}
      {sortedCameras.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Camera className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            No cameras found. Start the Trinetra AI Backend and seed cameras.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Camera snapshot</CardTitle>
                <CardDescription>
                  Live crowd level per camera
                  {lastUpdate && (
                    <span className="ml-2 text-xs text-gray-400">
                      · updated {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Camera</TableHead>
                    <TableHead className="text-right">People</TableHead>
                    <TableHead className="text-right">Fill</TableHead>
                    <TableHead>Density</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead className="hidden sm:table-cell">Detection</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCameras.map((cam) => {
                    const styles = densityStyles(cam.density_level as DensityLevel);
                    return (
                      <TableRow key={cam.camera_id}>
                        <TableCell className="font-mono text-sm text-gray-500">
                          {cam.channel || '—'}
                        </TableCell>
                        <TableCell className="font-medium">{cam.place_name}</TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            {cam.people_count}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray-600">
                          {cam.density_percentage.toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <Badge className={`${styles.bg} text-white hover:${styles.bg}`}>
                            {densityLabel[cam.density_level as DensityLevel]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-sm capitalize text-gray-700">
                            {cam.trend === 'increasing' ? (
                              <TrendingUp className="h-3.5 w-3.5 text-red-500" />
                            ) : cam.trend === 'decreasing' ? (
                              <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Activity className="h-3.5 w-3.5" />
                            )}
                            {cam.trend}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span
                            className={`text-xs font-medium ${
                              cam.detection_available ? 'text-emerald-700' : 'text-gray-400'
                            }`}
                          >
                            {cam.detection_available ? 'YOLO active' : (cam.detection_message ?? 'Offline')}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span
                            className={`text-xs font-medium ${
                              cam.is_active ? 'text-emerald-700' : 'text-gray-500'
                            }`}
                          >
                            {cam.is_active ? 'Online' : 'Offline'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveAnalytics;
