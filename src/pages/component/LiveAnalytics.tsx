import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  Users,
  AlertTriangle,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
} from 'lucide-react';

import { useDummyCrowdAnalytics } from '@/hooks/useDummyCrowdAnalytics';
import { useCctvCameras } from '@/hooks/useCctvCameras';
import { admin, densityStyles, type DensityLevel } from '@/lib/adminTheme';
import { getCameraChannelOrder, sortCamerasByChannel } from '@/lib/cctv';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const densityLabel: Record<DensityLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const LiveAnalytics = () => {
  const { cameras, loading } = useCctvCameras();
  const { analytics, summary } = useDummyCrowdAnalytics(cameras);
  const orderedCameras = sortCamerasByChannel(cameras);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${admin.iconWrap}`}>
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Analytics</h1>
          <p className="mt-1 text-gray-500">Crowd overview across 8 site cameras</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">People on site</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{summary.totalPeople}</p>
          </CardContent>
        </Card>
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Cameras live</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {summary.activeCameras}/{summary.cameraCount || 8}
            </p>
          </CardContent>
        </Card>
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">High density</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-gray-900">
              {summary.highDensity}
              <AlertTriangle className="h-5 w-5 text-gray-600" />
            </p>
          </CardContent>
        </Card>
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Critical</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-gray-900">
              {summary.critical}
              <Zap className="h-5 w-5 text-gray-600" />
            </p>
          </CardContent>
        </Card>
      </div>

      {orderedCameras.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Camera className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            Add cameras from CCTV Management to see analytics.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Camera snapshot</CardTitle>
            <CardDescription>Current crowd level per camera</CardDescription>
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
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderedCameras.map((camera) => {
                    const key = camera.id ?? camera.placeName;
                    const row = analytics.get(key);
                    if (!row) return null;
                    const channel = getCameraChannelOrder(camera);
                    const styles = densityStyles(row.crowdDensity);

                    return (
                      <TableRow key={key}>
                        <TableCell className="font-mono text-sm text-gray-500">
                          {channel < 999 ? channel : '—'}
                        </TableCell>
                        <TableCell className="font-medium">{row.placeName}</TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            {row.totalPeople}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray-600">
                          {row.densityPercentage}%
                        </TableCell>
                        <TableCell>
                          <Badge className={`${styles.bg} text-white hover:${styles.bg}`}>
                            {densityLabel[row.crowdDensity]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-sm capitalize text-gray-700">
                            {row.trend === 'increasing' ? (
                              <TrendingUp className="h-3.5 w-3.5" />
                            ) : row.trend === 'decreasing' ? (
                              <TrendingDown className="h-3.5 w-3.5" />
                            ) : (
                              <Activity className="h-3.5 w-3.5" />
                            )}
                            {row.trend}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span
                            className={`text-xs font-medium ${
                              row.status === 'active' ? 'text-emerald-700' : 'text-gray-500'
                            }`}
                          >
                            {row.status === 'active' ? 'Online' : 'Offline'}
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
