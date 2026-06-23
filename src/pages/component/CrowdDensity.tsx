import {
  Activity,
  AlertTriangle,
  BarChart3,
  Filter,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDummyDensityReports } from '@/hooks/useDummyCrowdAnalytics';
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

const CrowdDensity = () => {
  const { cameras, loading } = useCctvCameras();
  const densityData = useDummyDensityReports(cameras);
  const [filterDensity, setFilterDensity] = useState<'all' | DensityLevel>('all');

  const filtered = useMemo(() => {
    if (filterDensity === 'all') return densityData;
    return densityData.filter((row) => row.densityLevel === filterDensity);
  }, [densityData, filterDensity]);

  const totalPeople = densityData.reduce((sum, row) => sum + row.peopleCount, 0);
  const averageDensity =
    densityData.length > 0
      ? Math.round(
          densityData.reduce((sum, row) => sum + row.densityPercentage, 0) / densityData.length
        )
      : 0;
  const highAreas = densityData.filter(
    (row) => row.densityLevel === 'high' || row.densityLevel === 'critical'
  ).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${admin.iconWrap}`}>
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crowd Density</h1>
            <p className="mt-1 text-gray-500">Capacity usage across 8 site cameras</p>
          </div>
        </div>
        <Badge variant="outline" className="w-fit border-amber-300 bg-amber-50 text-amber-900">
          Demo data
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Total people</p>
              <p className="text-2xl font-bold">{totalPeople}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </CardContent>
        </Card>
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Avg density</p>
              <p className="text-2xl font-bold">{averageDensity}%</p>
            </div>
            <Activity className="h-8 w-8 text-gray-400" />
          </CardContent>
        </Card>
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Needs attention</p>
              <p className="text-2xl font-bold">{highAreas}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-gray-400" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <CardTitle className="text-base">Filter by level</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={filterDensity === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterDensity('all')}
              >
                All
              </Button>
              {(['low', 'medium', 'high', 'critical'] as const).map((level) => (
                <Button
                  key={level}
                  size="sm"
                  variant={filterDensity === level ? 'default' : 'outline'}
                  onClick={() => setFilterDensity(level)}
                >
                  {densityLabel[level]}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">People</TableHead>
                  <TableHead className="min-w-[140px]">Density</TableHead>
                  <TableHead className="text-right">Peak today</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => {
                  const camera = cameras.find((c) => (c.id ?? c.placeName) === row.cameraId);
                  const channel = camera ? getCameraChannelOrder(camera) : 999;
                  const styles = densityStyles(row.densityLevel);

                  return (
                    <TableRow key={row.cameraId}>
                      <TableCell className="font-mono text-sm text-gray-500">
                        {channel < 999 ? channel : '—'}
                      </TableCell>
                      <TableCell className="font-medium">{row.placeName}</TableCell>
                      <TableCell className="text-right">{row.peopleCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-gray-200">
                            <div
                              className={`h-2 rounded-full ${styles.bg}`}
                              style={{ width: `${row.densityPercentage}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs text-gray-600">
                            {row.densityPercentage}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-600">
                        {Math.round(row.peakDensity)}%
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-sm capitalize">
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {densityData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribution</CardTitle>
            <CardDescription>How many cameras fall in each density band</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(['low', 'medium', 'high', 'critical'] as const).map((level) => {
              const count = densityData.filter((row) => row.densityLevel === level).length;
              const pct = Math.round((count / densityData.length) * 100);
              const styles = densityStyles(level);
              return (
                <div key={level} className="flex items-center gap-3 text-sm">
                  <span className="w-20 font-medium capitalize">{densityLabel[level]}</span>
                  <div className="h-2 flex-1 rounded-full bg-gray-200">
                    <div className={`h-2 rounded-full ${styles.bg}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-16 text-right text-gray-600">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CrowdDensity;
