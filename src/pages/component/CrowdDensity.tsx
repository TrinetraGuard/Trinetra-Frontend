import {
  Activity,
  AlertTriangle,
  BarChart3,
  Filter,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo, useState } from 'react';

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
import { useCrowdDensity } from '@/hooks/useTrinetraCrowdData';

const densityLabel: Record<DensityLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const CrowdDensity = () => {
  const { density, loading, error, totalPeople, refresh } = useCrowdDensity();
  const [filterDensity, setFilterDensity] = useState<'all' | DensityLevel>('all');

  const filtered = useMemo(() => {
    if (filterDensity === 'all') return density;
    return density.filter((row) => row.density_level === filterDensity);
  }, [density, filterDensity]);

  const avgDensityPct =
    density.length > 0
      ? Math.round(
          density.reduce((s, d) => {
            const peakAvg = d.today_buckets.reduce((mx, b) => Math.max(mx, b.avg_people), 0);
            return s + peakAvg;
          }, 0) /
          density.length /
          150 *
          100,
        )
      : 0;

  const highAreas = density.filter(
    (d) => d.density_level === 'high' || d.density_level === 'critical',
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${admin.iconWrap}`}>
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crowd Density</h1>
            <p className="mt-1 text-gray-500">Today's capacity usage across all site cameras</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => void refresh()}>
          <RefreshCw className="mr-1 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠ {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Current total</p>
              <p className="text-2xl font-bold">{totalPeople}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </CardContent>
        </Card>
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Avg peak density</p>
              <p className="text-2xl font-bold">{avgDensityPct}%</p>
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
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </CardContent>
        </Card>
      </div>

      {/* Filtered table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <CardTitle className="text-base">Filter by density level</CardTitle>
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
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              No cameras in the selected density band.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="min-w-[160px]">Density</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Peak today</TableHead>
                    <TableHead className="hidden sm:table-cell">Busiest hour</TableHead>
                    <TableHead>Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row, idx) => {
                    const styles = densityStyles(row.density_level as DensityLevel);
                    const peakPeople = row.today_buckets.reduce(
                      (mx, b) => Math.max(mx, b.max_people),
                      0,
                    );
                    const peakPct = Math.round((peakPeople / 150) * 100);
                    const curPct = Math.round((row.current_count / 150) * 100);

                    return (
                      <TableRow key={row.camera_id}>
                        <TableCell className="font-mono text-sm text-gray-500">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{row.place_name}</TableCell>
                        <TableCell className="text-right">{row.current_count}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-gray-200">
                              <div
                                className={`h-2 rounded-full transition-all ${styles.bg}`}
                                style={{ width: `${curPct}%` }}
                              />
                            </div>
                            <span className="w-10 text-right text-xs text-gray-600">
                              {curPct}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-right text-sm text-gray-600 sm:table-cell">
                          {peakPct}%
                        </TableCell>
                        <TableCell className="hidden text-sm text-gray-600 sm:table-cell">
                          {row.peak_hour ?? '—'}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${styles.bg} text-white hover:${styles.bg}`}>
                            {densityLabel[row.density_level as DensityLevel]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribution chart */}
      {density.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribution</CardTitle>
            <CardDescription>Cameras per density band</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(['low', 'medium', 'high', 'critical'] as const).map((level) => {
              const count = density.filter((d) => d.density_level === level).length;
              const pct = density.length > 0 ? Math.round((count / density.length) * 100) : 0;
              const styles = densityStyles(level);
              return (
                <div key={level} className="flex items-center gap-3 text-sm">
                  <span className="w-20 font-medium capitalize">{densityLabel[level]}</span>
                  <div className="h-2 flex-1 rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full transition-all ${styles.bg}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-20 text-right text-gray-600">
                    {count} cam{count !== 1 ? 's' : ''} ({pct}%)
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Hourly heatmap for first 4 cameras */}
      {density.slice(0, 4).map((d) => (
        <Card key={d.camera_id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{d.place_name} — Hourly profile (today)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-[2px] h-16">
              {d.today_buckets.map((b) => {
                const pct = b.avg_people > 0 ? Math.round((b.avg_people / 150) * 100) : 0;
                const barH = Math.max(4, pct);
                const color =
                  pct >= 85
                    ? 'bg-red-500'
                    : pct >= 60
                      ? 'bg-orange-400'
                      : pct >= 30
                        ? 'bg-amber-400'
                        : 'bg-emerald-400';
                return (
                  <div
                    key={b.hour}
                    className="group relative flex-1 cursor-default"
                    title={`${b.hour}: avg ${b.avg_people} people`}
                  >
                    <div
                      className={`w-full rounded-sm ${color} transition-all`}
                      style={{ height: `${barH}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-gray-400">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CrowdDensity;
