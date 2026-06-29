import {
  Brain,
  Clock,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

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
import { useCrowdPredictions, type PredictionWindow } from '@/hooks/useTrinetraCrowdData';
import type { PredictionPoint } from '@/lib/trinetraApi';

const riskLevel = (people: number, capacity = 150): DensityLevel => {
  const pct = (people / capacity) * 100;
  if (pct >= 85) return 'critical';
  if (pct >= 60) return 'high';
  if (pct >= 30) return 'medium';
  return 'low';
};

const windowLabel: Record<PredictionWindow, string> = {
  '1h': 'Next 1 hour',
  '6h': 'Next 6 hours',
  '24h': 'Next 24 hours',
};

const CrowdPredictions = () => {
  const { predictions, loading, error, refresh } = useCrowdPredictions();
  const [window, setWindow] = useState<PredictionWindow>('6h');

  const getPoints = (pred: (typeof predictions)[number]): PredictionPoint[] => {
    if (window === '1h') return pred.next_1h;
    if (window === '6h') return pred.next_6h;
    return pred.next_24h;
  };

  const allPoints = predictions.flatMap(getPoints);
  const avgPredicted =
    allPoints.length > 0
      ? Math.round(allPoints.reduce((s, p) => s + p.predicted_people, 0) / allPoints.length)
      : 0;
  const highRisk = allPoints.filter((p) => riskLevel(p.predicted_people) === 'high' || riskLevel(p.predicted_people) === 'critical').length;
  const maxPredicted = allPoints.length > 0 ? Math.max(...allPoints.map((p) => p.predicted_people)) : 0;

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
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crowd Predictions</h1>
            <p className="mt-1 text-gray-500">
              Statistical forecasts based on historical YOLO detection patterns
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(['1h', '6h', '24h'] as const).map((w) => (
            <Button
              key={w}
              size="sm"
              variant={window === w ? 'default' : 'outline'}
              onClick={() => setWindow(w)}
            >
              {w}
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">Avg predicted ({window})</p>
            <p className="text-2xl font-bold">{avgPredicted}</p>
          </CardContent>
        </Card>
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">Peak predicted</p>
            <p className="text-2xl font-bold">{maxPredicted}</p>
          </CardContent>
        </Card>
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">High-risk slots</p>
            <p className="text-2xl font-bold text-amber-600">{highRisk}</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-camera prediction cards */}
      {predictions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No prediction data available yet. Predictions improve after 24h of YOLO detection data.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {predictions.map((pred) => {
            const points = getPoints(pred);
            const maxP = points.length > 0 ? Math.max(...points.map((p) => p.predicted_people)) : 1;

            return (
              <Card key={pred.camera_id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{pred.place_name}</CardTitle>
                    <span className="text-xs text-gray-400">{windowLabel[window]}</span>
                  </div>
                  <CardDescription className="text-xs text-amber-700">
                    {pred.recommendation}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Mini bar chart */}
                  <div className="flex items-end gap-1 h-12">
                    {points.map((p) => {
                      const h = maxP > 0 ? Math.max(4, Math.round((p.predicted_people / maxP) * 100)) : 4;
                      const risk = riskLevel(p.predicted_people);
                      const color =
                        risk === 'critical'
                          ? 'bg-red-500'
                          : risk === 'high'
                            ? 'bg-orange-400'
                            : risk === 'medium'
                              ? 'bg-amber-400'
                              : 'bg-emerald-400';
                      return (
                        <div
                          key={p.time_label}
                          className="group relative flex-1"
                          title={`${p.time_label}: ${p.predicted_people} people`}
                        >
                          <div
                            className={`w-full rounded-sm ${color}`}
                            style={{ height: `${h}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Detail table (first 6 rows) */}
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs h-8">Time</TableHead>
                        <TableHead className="text-xs h-8 text-right">People</TableHead>
                        <TableHead className="text-xs h-8">Risk</TableHead>
                        <TableHead className="text-xs h-8 text-right">Conf.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {points.slice(0, 6).map((p) => {
                        const risk = riskLevel(p.predicted_people);
                        const styles = densityStyles(risk);
                        return (
                          <TableRow key={p.time_label} className="hover:bg-gray-50/50">
                            <TableCell className="text-xs py-1.5">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                {p.time_label}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs py-1.5 text-right">
                              <span className="inline-flex items-center gap-1 justify-end">
                                <Users className="h-3 w-3 text-gray-400" />
                                {p.predicted_people}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs py-1.5">
                              <Badge className={`${styles.bg} text-white hover:${styles.bg} text-[10px] px-1.5`}>
                                {risk}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs py-1.5 text-right text-gray-400">
                              {Math.round(p.confidence * 100)}%
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {points.length > 6 && (
                    <p className="text-xs text-center text-gray-400">
                      +{points.length - 6} more time slots
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CrowdPredictions;
