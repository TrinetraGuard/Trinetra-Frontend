import {
    Activity,
    AlertTriangle,
    Brain,
    Calendar,
    Clock,
    Info,
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
import { buildCrowdPredictions } from '@/lib/crowdReports';
import type { PredictionTimeframe } from '@/types/crowdReports';

const CrowdPredictions = () => {
  const { cameras, loading } = useCctvCameras();
  const [predictionTimeframe, setPredictionTimeframe] = useState<PredictionTimeframe>('today');
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { analytics, scanning, lastScanAt, configError, rescan } = useLiveCrowdAnalytics(
    cameras,
    autoRefresh
  );
  const logs = useCrowdLogHistory();

  const predictions = useMemo(
    () => buildCrowdPredictions(cameras, analytics, logs, predictionTimeframe),
    [analytics, cameras, logs, predictionTimeframe]
  );

  const getDensityColor = (level: DensityLevel) => densityStyles(level);

  const riskStyles: Record<'low' | 'medium' | 'high', { bg: string; text: string; border: string }> = {
    low: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-300' },
    medium: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-400' },
    high: { bg: 'bg-gray-200', text: 'text-gray-900', border: 'border-gray-500' },
  };

  const allPredictions = Array.from(predictions.values()).flat();
  const filteredPredictions = selectedCamera
    ? predictions.get(selectedCamera) || []
    : allPredictions;

  const highRiskPredictions = filteredPredictions.filter(p => p.riskLevel === 'high');
  const criticalPredictions = filteredPredictions.filter(p => p.densityLevel === 'critical');
  const averagePredictedPeople = filteredPredictions.length > 0
    ? filteredPredictions.reduce((sum, p) => sum + p.predictedPeople, 0) / filteredPredictions.length
    : 0;

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
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crowd Predictions</h1>
              <p className="text-gray-500 mt-1">Forecasts from recorded scan history and current live trends</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Avg Predicted People</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(averagePredictedPeople)}</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">High Risk Predictions</p>
                <p className="text-3xl font-bold text-gray-900">{highRiskPredictions.length}</p>
                <p className="text-xs text-gray-500 mt-1">Requiring attention</p>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Critical Predictions</p>
                <p className="text-3xl font-bold text-gray-900">{criticalPredictions.length}</p>
                <p className="text-xs text-gray-500 mt-1">Immediate action needed</p>
              </div>
              <div className="p-3 bg-black rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${admin.statCard} shadow-sm`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Prediction Accuracy</p>
                <p className="text-3xl font-bold text-gray-900">
                  {filteredPredictions.length > 0
                    ? Math.round(filteredPredictions.reduce((sum, p) => sum + p.confidence, 0) / filteredPredictions.length)
                    : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Average confidence</p>
              </div>
              <div className="p-3 bg-gray-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <CardTitle className="text-lg">Prediction Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Timeframe:</span>
              <div className="flex gap-2">
                {(['today', 'tomorrow', 'week'] as const).map((timeframe) => (
                  <Button
                    key={timeframe}
                    variant={predictionTimeframe === timeframe ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPredictionTimeframe(timeframe)}
                    className={predictionTimeframe === timeframe ? 'bg-gray-900 hover:bg-gray-800 text-white' : ''}
                  >
                    {timeframe === 'today' ? 'Today' : timeframe === 'tomorrow' ? 'Tomorrow' : 'Next Week'}
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

      {/* Predictions Display */}
      {filteredPredictions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-lg">No predictions available</p>
              <p className="text-sm text-gray-400 mt-2">
                Predictions improve as more live scans are recorded. Run a scan from Live Analytics or here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Array.from(predictions.entries()).map(([cameraId, cameraPredictions]) => {
            if (selectedCamera && cameraId !== selectedCamera) return null;
            
            const camera = cameras.find(
              (item) => (item.id ?? item.placeName) === cameraId
            );
            if (!camera) return null;

            return (
              <Card key={cameraId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${admin.iconWrap}`}>
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{camera.placeName}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-xs">
                            {camera.latitude.toFixed(6)}, {camera.longitude.toFixed(6)}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${admin.badge}`}>
                      {cameraPredictions.length} Predictions
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Predictions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cameraPredictions.map((prediction, index) => {
                      const colors = getDensityColor(prediction.densityLevel);
                      
                      return (
                        <Card 
                          key={index} 
                          className={`border-2 ${getDensityColor(prediction.densityLevel).border} ${getDensityColor(prediction.densityLevel).light}`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-600" />
                                <CardTitle className="text-sm">{prediction.timeSlot}</CardTitle>
                              </div>
                              <Badge
                                variant="default"
                                className={`${colors.bg} text-white text-xs`}
                              >
                                {prediction.densityLevel.toUpperCase()}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {/* Predicted People */}
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                              <p className="text-xs font-medium text-gray-600 mb-1">Predicted People</p>
                              <p className="text-2xl font-bold text-gray-900">{prediction.predictedPeople}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {prediction.trend === 'increasing' ? (
                                  <TrendingUp className="w-3 h-3 text-gray-800" />
                                ) : prediction.trend === 'decreasing' ? (
                                  <TrendingDown className="w-3 h-3 text-gray-600" />
                                ) : (
                                  <Activity className="w-3 h-3 text-gray-600" />
                                )}
                                <span className="text-xs font-semibold text-gray-700">
                                  {prediction.predictedChange > 0 ? '+' : ''}{prediction.predictedChange}% vs avg
                                </span>
                              </div>
                            </div>

                            {/* Density Bar */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-gray-600">Density</p>
                                <p className="text-xs font-bold text-gray-900">{prediction.predictedDensity}%</p>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${colors.bg}`}
                                  style={{ width: `${prediction.predictedDensity}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Confidence & Risk */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-600 mb-1">Confidence</p>
                                <p className="text-sm font-bold text-gray-900">{prediction.confidence}%</p>
                              </div>
                              <div className={`p-2 rounded-lg border ${riskStyles[prediction.riskLevel].bg} ${riskStyles[prediction.riskLevel].border}`}>
                                <p className="text-xs text-gray-600 mb-1">Risk</p>
                                <p className={`text-sm font-bold capitalize ${riskStyles[prediction.riskLevel].text}`}>
                                  {prediction.riskLevel}
                                </p>
                              </div>
                            </div>

                            {/* Recommendation */}
                            {prediction.riskLevel === 'high' && (
                              <div className="p-2 bg-gray-200 border border-gray-400 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <Info className="w-3 h-3 text-gray-800 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-gray-900">{prediction.recommendation}</p>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Prediction Chart */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-4">Predicted Crowd Pattern</p>
                    <div className="flex items-end gap-2 h-48">
                      {cameraPredictions.map((prediction, index) => {
                        const maxPeople = Math.max(...cameraPredictions.map(p => p.predictedPeople));
                        const height = (prediction.predictedPeople / maxPeople) * 100;
                        const colors = getDensityColor(prediction.densityLevel);
                        
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div
                              className={`w-full rounded-t transition-all hover:opacity-80 ${colors.bg}`}
                              style={{ height: `${height}%` }}
                              title={`${prediction.timeSlot}: ${prediction.predictedPeople} people (${prediction.confidence}% confidence)`}
                            ></div>
                            <p className="text-xs text-gray-600 mt-2 text-center">{prediction.timeSlot.split(' - ')[0]}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
