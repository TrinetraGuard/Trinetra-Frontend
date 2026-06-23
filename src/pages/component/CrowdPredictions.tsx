import { Brain, Clock, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDummyPredictions } from '@/hooks/useDummyCrowdAnalytics';
import { useCctvCameras } from '@/hooks/useCctvCameras';
import { admin, densityStyles, type DensityLevel } from '@/lib/adminTheme';
import { getCameraChannelOrder } from '@/lib/cctv';
import type { PredictionTimeframe } from '@/types/crowdReports';
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

const CrowdPredictions = () => {
  const { cameras, loading } = useCctvCameras();
  const [timeframe, setTimeframe] = useState<PredictionTimeframe>('today');
  const predictionsMap = useDummyPredictions(cameras, timeframe);

  const flatPredictions = useMemo(
    () => Array.from(predictionsMap.values()).flat(),
    [predictionsMap]
  );

  const highRisk = flatPredictions.filter((p) => p.riskLevel === 'high').length;
  const avgPredicted =
    flatPredictions.length > 0
      ? Math.round(
          flatPredictions.reduce((sum, p) => sum + p.predictedPeople, 0) / flatPredictions.length
        )
      : 0;

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
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crowd Predictions</h1>
            <p className="mt-1 text-gray-500">Short-range forecasts for 8 site cameras</p>
          </div>
        </div>
        <Badge variant="outline" className="w-fit border-amber-300 bg-amber-50 text-amber-900">
          Demo data
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">Avg predicted</p>
            <p className="text-2xl font-bold">{avgPredicted}</p>
          </CardContent>
        </Card>
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">High risk slots</p>
            <p className="text-2xl font-bold">{highRisk}</p>
          </CardContent>
        </Card>
        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">Confidence</p>
            <p className="text-2xl font-bold">{timeframe === 'week' ? '68' : '82'}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Timeframe</CardTitle>
            <div className="flex gap-2">
              {(['today', 'tomorrow', 'week'] as const).map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant={timeframe === option ? 'default' : 'outline'}
                  onClick={() => setTimeframe(option)}
                >
                  {option === 'today' ? 'Today' : option === 'tomorrow' ? 'Tomorrow' : 'This week'}
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
                  <TableHead>Camera</TableHead>
                  <TableHead>Window</TableHead>
                  <TableHead className="text-right">Predicted</TableHead>
                  <TableHead>Density</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from(predictionsMap.entries()).flatMap(([cameraId, items]) => {
                  const camera = cameras.find((c) => (c.id ?? c.placeName) === cameraId);
                  const channel = camera ? getCameraChannelOrder(camera) : 999;

                  return items.map((prediction, index) => {
                    const styles = densityStyles(prediction.densityLevel);
                    return (
                      <TableRow key={`${cameraId}-${index}`}>
                        <TableCell className="font-mono text-sm text-gray-500">
                          {index === 0 ? (channel < 999 ? channel : '—') : ''}
                        </TableCell>
                        <TableCell className="font-medium">
                          {index === 0 ? prediction.placeName : ''}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                            <Clock className="h-3.5 w-3.5" />
                            {prediction.timeSlot}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center justify-end gap-1">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            {prediction.predictedPeople}
                            {prediction.trend === 'increasing' ? (
                              <TrendingUp className="h-3.5 w-3.5 text-gray-600" />
                            ) : prediction.trend === 'decreasing' ? (
                              <TrendingDown className="h-3.5 w-3.5 text-gray-600" />
                            ) : null}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${styles.bg} text-white hover:${styles.bg}`}>
                            {densityLabel[prediction.densityLevel]} · {prediction.predictedDensity}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs font-medium capitalize ${
                              prediction.riskLevel === 'high'
                                ? 'text-red-700'
                                : prediction.riskLevel === 'medium'
                                  ? 'text-amber-700'
                                  : 'text-gray-600'
                            }`}
                          >
                            {prediction.riskLevel}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  });
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {highRisk > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-amber-900">Suggested action</CardTitle>
            <CardDescription className="text-amber-800">
              Site Camera 5 is forecast to stay at critical density — deploy extra volunteers near
              that zone.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default CrowdPredictions;
