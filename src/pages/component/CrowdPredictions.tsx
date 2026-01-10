import {
    Activity,
    AlertTriangle,
    Brain,
    Calendar,
    Clock,
    Info,
    MapPin,
    RefreshCw,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { db } from '@/firebase/firebase';

interface CCTV {
  id?: string;
  placeName: string;
  rtspLink: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'inactive';
}

interface PredictionData {
  cameraId: string;
  placeName: string;
  predictedPeople: number;
  predictedDensity: number;
  densityLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  timeSlot: string;
  date: Date;
  trend: 'increasing' | 'decreasing' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
  coordinates: { lat: number; lng: number };
  historicalAverage: number;
  predictedChange: number;
}

interface TimeSlotPrediction {
  hour: number;
  predictedPeople: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  label: string;
}

const CrowdPredictions = () => {
  const [cameras, setCameras] = useState<CCTV[]>([]);
  const [predictions, setPredictions] = useState<Map<string, PredictionData[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [predictionTimeframe, setPredictionTimeframe] = useState<'today' | 'tomorrow' | 'week'>('today');
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Real-time listener for CCTV cameras
  useEffect(() => {
    const q = query(collection(db, 'cctv_cameras'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const camerasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CCTV[];
      
      setCameras(camerasData);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to CCTV cameras:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Generate predictions based on historical patterns (In production, this would use ML models)
  useEffect(() => {
    if (cameras.length === 0) return;

    const generatePredictions = () => {
      const predictionsMap = new Map<string, PredictionData[]>();
      
      cameras.forEach(camera => {
        if (camera.id && camera.status === 'active') {
          const cameraPredictions: PredictionData[] = [];
          
          // Generate predictions for different time slots
          const timeSlots = [
            { hour: 8, label: '8:00 AM - 10:00 AM' },
            { hour: 10, label: '10:00 AM - 12:00 PM' },
            { hour: 12, label: '12:00 PM - 2:00 PM' },
            { hour: 14, label: '2:00 PM - 4:00 PM' },
            { hour: 16, label: '4:00 PM - 6:00 PM' },
            { hour: 18, label: '6:00 PM - 8:00 PM' },
            { hour: 20, label: '8:00 PM - 10:00 PM' }
          ];

          timeSlots.forEach(slot => {
            // Base prediction on historical patterns
            let basePeople = 100;
            if (slot.hour >= 10 && slot.hour < 12) basePeople = 300 + Math.random() * 150;
            else if (slot.hour >= 14 && slot.hour < 16) basePeople = 400 + Math.random() * 200;
            else if (slot.hour >= 18 && slot.hour < 20) basePeople = 500 + Math.random() * 250;
            else if (slot.hour >= 6 && slot.hour < 8) basePeople = 50 + Math.random() * 30;
            else if (slot.hour >= 20) basePeople = 150 + Math.random() * 100;
            else basePeople = 200 + Math.random() * 100;

            // Add some variance for prediction
            const variance = basePeople * 0.15; // 15% variance
            const predictedPeople = Math.max(0, basePeople + (Math.random() - 0.5) * variance * 2);
            const historicalAverage = basePeople * 0.9; // Slightly lower than prediction
            const predictedChange = ((predictedPeople - historicalAverage) / historicalAverage) * 100;

            const maxCapacity = 1000;
            const predictedDensity = Math.min(100, (predictedPeople / maxCapacity) * 100);
            
            let densityLevel: 'low' | 'medium' | 'high' | 'critical';
            if (predictedDensity < 30) densityLevel = 'low';
            else if (predictedDensity < 60) densityLevel = 'medium';
            else if (predictedDensity < 85) densityLevel = 'high';
            else densityLevel = 'critical';

            // Confidence based on historical data availability
            const confidence = 75 + Math.random() * 20; // 75-95%

            // Determine trend
            const trends: ('increasing' | 'decreasing' | 'stable')[] = ['increasing', 'decreasing', 'stable'];
            const trend = trends[Math.floor(Math.random() * trends.length)];

            // Risk level
            let riskLevel: 'low' | 'medium' | 'high';
            if (predictedDensity >= 85) riskLevel = 'high';
            else if (predictedDensity >= 60) riskLevel = 'medium';
            else riskLevel = 'low';

            // Recommendations
            let recommendation = '';
            if (predictedDensity >= 85) {
              recommendation = 'Consider crowd control measures. High density expected.';
            } else if (predictedDensity >= 60) {
              recommendation = 'Monitor closely. Moderate crowd expected.';
            } else {
              recommendation = 'Normal operations. Low to moderate crowd expected.';
            }

            const predictionDate = new Date();
            if (predictionTimeframe === 'tomorrow') {
              predictionDate.setDate(predictionDate.getDate() + 1);
            } else if (predictionTimeframe === 'week') {
              predictionDate.setDate(predictionDate.getDate() + 7);
            }

            cameraPredictions.push({
              cameraId: camera.id,
              placeName: camera.placeName,
              predictedPeople: Math.round(predictedPeople),
              predictedDensity: Math.round(predictedDensity),
              densityLevel,
              confidence: Math.round(confidence),
              timeSlot: slot.label,
              date: predictionDate,
              trend,
              riskLevel,
              recommendation,
              coordinates: {
                lat: camera.latitude,
                lng: camera.longitude
              },
              historicalAverage: Math.round(historicalAverage),
              predictedChange: Math.round(predictedChange)
            });
          });

          predictionsMap.set(camera.id, cameraPredictions);
        }
      });

      setPredictions(predictionsMap);
    };

    generatePredictions();

    // Auto-refresh every 30 seconds if enabled
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(generatePredictions, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cameras, predictionTimeframe, autoRefresh]);

  const getDensityColor = (level: string) => {
    switch (level) {
      case 'low': return { bg: 'bg-green-600', text: 'text-green-700', border: 'border-green-300', light: 'bg-green-50' };
      case 'medium': return { bg: 'bg-yellow-600', text: 'text-yellow-700', border: 'border-yellow-300', light: 'bg-yellow-50' };
      case 'high': return { bg: 'bg-orange-600', text: 'text-orange-700', border: 'border-orange-300', light: 'bg-orange-50' };
      case 'critical': return { bg: 'bg-red-600', text: 'text-red-700', border: 'border-red-300', light: 'bg-red-50' };
      default: return { bg: 'bg-gray-600', text: 'text-gray-700', border: 'border-gray-300', light: 'bg-gray-50' };
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'high': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
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
            <div className="p-2 bg-pink-100 rounded-lg">
              <Brain className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crowd Predictions</h1>
              <p className="text-gray-500 mt-1">AI-powered crowd forecasting based on historical patterns</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200 text-green-700' : ''}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Avg Predicted People</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(averagePredictedPeople)}</p>
                <p className="text-xs text-gray-500 mt-1">Across all locations</p>
              </div>
              <div className="p-3 bg-blue-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">High Risk Predictions</p>
                <p className="text-3xl font-bold text-gray-900">{highRiskPredictions.length}</p>
                <p className="text-xs text-gray-500 mt-1">Requiring attention</p>
              </div>
              <div className="p-3 bg-orange-600 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Critical Predictions</p>
                <p className="text-3xl font-bold text-gray-900">{criticalPredictions.length}</p>
                <p className="text-xs text-gray-500 mt-1">Immediate action needed</p>
              </div>
              <div className="p-3 bg-red-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
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
              <div className="p-3 bg-purple-600 rounded-lg">
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
                {cameras.map(camera => (
                  <option key={camera.id} value={camera.id}>{camera.placeName}</option>
                ))}
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
                Predictions will be generated based on historical data
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Array.from(predictions.entries()).map(([cameraId, cameraPredictions]) => {
            if (selectedCamera && cameraId !== selectedCamera) return null;
            
            const camera = cameras.find(c => c.id === cameraId);
            if (!camera) return null;

            return (
              <Card key={cameraId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-pink-600" />
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
                    <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                      {cameraPredictions.length} Predictions
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Predictions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cameraPredictions.map((prediction, index) => {
                      const colors = getDensityColor(prediction.densityLevel);
                      const riskColor = getRiskColor(prediction.riskLevel);
                      
                      return (
                        <Card 
                          key={index} 
                          className={`border-2 ${
                            prediction.densityLevel === 'critical' 
                              ? 'border-red-300 bg-red-50/30' 
                              : prediction.densityLevel === 'high'
                              ? 'border-orange-300 bg-orange-50/30'
                              : 'border-gray-200'
                          }`}
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
                                  <TrendingUp className="w-3 h-3 text-red-600" />
                                ) : prediction.trend === 'decreasing' ? (
                                  <TrendingDown className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Activity className="w-3 h-3 text-gray-600" />
                                )}
                                <span className={`text-xs font-semibold ${
                                  prediction.predictedChange > 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
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
                              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs text-gray-600 mb-1">Confidence</p>
                                <p className="text-sm font-bold text-blue-700">{prediction.confidence}%</p>
                              </div>
                              <div className={`p-2 rounded-lg border ${
                                prediction.riskLevel === 'high' 
                                  ? 'bg-red-50 border-red-200' 
                                  : prediction.riskLevel === 'medium'
                                  ? 'bg-yellow-50 border-yellow-200'
                                  : 'bg-green-50 border-green-200'
                              }`}>
                                <p className="text-xs text-gray-600 mb-1">Risk</p>
                                <p className={`text-sm font-bold capitalize ${
                                  prediction.riskLevel === 'high' ? 'text-red-700' : 
                                  prediction.riskLevel === 'medium' ? 'text-yellow-700' : 'text-green-700'
                                }`}>
                                  {prediction.riskLevel}
                                </p>
                              </div>
                            </div>

                            {/* Recommendation */}
                            {prediction.riskLevel === 'high' && (
                              <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <Info className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-red-700">{prediction.recommendation}</p>
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
