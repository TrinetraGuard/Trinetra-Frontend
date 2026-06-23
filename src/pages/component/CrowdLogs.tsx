import { BarChart3, Clock, FileText, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { useDummyCrowdLogs, useDummyLogSummaries } from '@/hooks/useDummyCrowdAnalytics';
import { useCctvCameras } from '@/hooks/useCctvCameras';
import { admin, densityStyles, type DensityLevel } from '@/lib/adminTheme';
import { getCameraChannelOrder } from '@/lib/cctv';
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

const CrowdLogs = () => {
  const { cameras, loading } = useCctvCameras();
  const logs = useDummyCrowdLogs(cameras);
  const summaries = useDummyLogSummaries(cameras);

  const totalPeople = logs.reduce((sum, log) => sum + log.peopleCount, 0);
  const avgPeople = logs.length > 0 ? Math.round(totalPeople / logs.length) : 0;

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
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crowd Logs</h1>
          <p className="mt-1 text-gray-500">Recent scan summary for each camera</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">Cameras logged</p>
            <p className="text-2xl font-bold">{logs.length}</p>
          </CardContent>
        </Card>
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">People (latest)</p>
            <p className="text-2xl font-bold">{totalPeople}</p>
          </CardContent>
        </Card>
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">Avg per camera</p>
            <p className="text-2xl font-bold">{avgPeople}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Latest readings</CardTitle>
          <CardDescription>One recent entry per camera</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Camera</TableHead>
                  <TableHead className="text-right">People</TableHead>
                  <TableHead>Density</TableHead>
                  <TableHead className="hidden sm:table-cell">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const camera = cameras.find((c) => (c.id ?? c.placeName) === log.cameraId);
                  const channel = camera ? getCameraChannelOrder(camera) : 999;
                  const styles = densityStyles(log.densityLevel);
                  const time = new Date(log.timestamp).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  });

                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm text-gray-500">
                        {channel < 999 ? channel : '—'}
                      </TableCell>
                      <TableCell className="font-medium">{log.placeName}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-gray-400" />
                          {log.peopleCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${styles.bg} text-white hover:${styles.bg}`}>
                          {densityLabel[log.densityLevel]} · {log.densityPercentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-sm text-gray-500 sm:table-cell">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {time}
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

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-lg">Daily pattern (sample)</CardTitle>
          </div>
          <CardDescription>Peak vs quiet hours — compact view per camera</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead>Camera</TableHead>
                  <TableHead className="text-right">Avg</TableHead>
                  <TableHead className="text-right">Peak</TableHead>
                  <TableHead>Busiest</TableHead>
                  <TableHead>Quietest</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaries.map((summary) => (
                  <TableRow key={summary.cameraId}>
                    <TableCell className="font-medium">{summary.placeName}</TableCell>
                    <TableCell className="text-right">{summary.averagePeople}</TableCell>
                    <TableCell className="text-right">{summary.peakPeople}</TableCell>
                    <TableCell className="text-sm text-gray-600">{summary.peakTime}</TableCell>
                    <TableCell className="text-sm text-gray-600">{summary.quietTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrowdLogs;
