import {
  BarChart3,
  Clock,
  FileText,
  RefreshCw,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { admin, densityStyles, type DensityLevel } from '@/lib/adminTheme';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCrowdLogs } from '@/hooks/useTrinetraCrowdData';

const densityLabel: Record<DensityLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const CrowdLogs = () => {
  const [hours, setHours] = useState(24);
  const { logs, loading, error, totalPeople, avgPeople, maxPeople, refresh } = useCrowdLogs(
    undefined,
    hours,
  );

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
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crowd Logs</h1>
            <p className="mt-1 text-gray-500">
              Detection history from all site cameras
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Time window selector */}
          {([6, 24, 48, 168] as const).map((h) => (
            <Button
              key={h}
              size="sm"
              variant={hours === h ? 'default' : 'outline'}
              onClick={() => setHours(h)}
            >
              {h < 24 ? `${h}h` : h === 24 ? '24h' : h === 48 ? '2d' : '7d'}
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={() => void refresh()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠ {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">Log entries</p>
            <p className="text-2xl font-bold">{logs.length}</p>
          </CardContent>
        </Card>
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">Total detections</p>
            <p className="text-2xl font-bold">{totalPeople}</p>
          </CardContent>
        </Card>
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">Avg per reading</p>
            <p className="text-2xl font-bold">{avgPeople}</p>
          </CardContent>
        </Card>
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">Peak count</p>
            <p className="text-2xl font-bold">{maxPeople}</p>
          </CardContent>
        </Card>
      </div>

      {/* Log table */}
      {logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No crowd logs found for the selected time window.
            <br />
            <span className="text-sm">Make sure the Trinetra AI Backend is running.</span>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Detection log</CardTitle>
            <CardDescription>
              Latest YOLO readings — {logs.length} entries (last {hours}h)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-50">
                  <TableRow className="hover:bg-gray-50">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Camera</TableHead>
                    <TableHead className="text-right">People</TableHead>
                    <TableHead>Density</TableHead>
                    <TableHead className="hidden sm:table-cell">Trend</TableHead>
                    <TableHead className="hidden sm:table-cell text-right">Conf.</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, idx) => {
                    const styles = densityStyles(log.density_level as DensityLevel);
                    const time = new Date(log.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs text-gray-400">
                          {logs.length - idx}
                        </TableCell>
                        <TableCell className="font-medium text-sm">{log.place_name}</TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            {log.people_count}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${styles.bg} text-white hover:${styles.bg} text-xs`}>
                            {densityLabel[log.density_level as DensityLevel]}{' '}
                            {log.density_percentage.toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-sm capitalize text-gray-600 sm:table-cell">
                          {log.trend}
                        </TableCell>
                        <TableCell className="hidden text-right text-xs text-gray-400 sm:table-cell">
                          {(log.detection_confidence * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
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
      )}
    </div>
  );
};

export default CrowdLogs;
