import {
    BarChart3,
    Calendar,
    Clock,
    Download,
    FileText,
    Filter,
    MapPin,
    Users
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

interface CrowdLogEntry {
  cameraId: string;
  placeName: string;
  timestamp: Date;
  peopleCount: number;
  densityPercentage: number;
  densityLevel: 'low' | 'medium' | 'high' | 'critical';
  hour: number;
  dayOfWeek: string;
}

interface TimeSlotAnalysis {
  hour: number;
  averagePeople: number;
  peakPeople: number;
  averageDensity: number;
  occurrences: number;
  label: string;
}

interface CameraLogSummary {
  cameraId: string;
  placeName: string;
  totalVisits: number;
  averagePeople: number;
  peakPeople: number;
  peakTime: string;
  quietTime: string;
  busiestDay: string;
  coordinates: { lat: number; lng: number };
  timeSlots: TimeSlotAnalysis[];
}

const CrowdLogs = () => {
  const [cameras, setCameras] = useState<CCTV[]>([]);
  const [logs, setLogs] = useState<CrowdLogEntry[]>([]);
  const [summaries, setSummaries] = useState<Map<string, CameraLogSummary>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

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

  // Generate historical log data (In production, this would come from your database)
  useEffect(() => {
    if (cameras.length === 0) return;

    const generateLogs = () => {
      const newLogs: CrowdLogEntry[] = [];
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      // Generate logs for the selected date range
      const daysToGenerate = dateRange === 'today' ? 1 : dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90;
      
      cameras.forEach(camera => {
        if (camera.id && camera.status === 'active') {
          for (let day = 0; day < daysToGenerate; day++) {
            const date = new Date();
            date.setDate(date.getDate() - day);
            const dayOfWeek = daysOfWeek[date.getDay()];
            
            // Generate hourly data (every 2 hours for performance)
            for (let hour = 6; hour < 22; hour += 2) {
              // Simulate realistic crowd patterns
              // Peak hours: 10-12, 14-16, 18-20
              // Quiet hours: 6-8, 20-22
              let basePeople = 50;
              if (hour >= 10 && hour < 12) basePeople = 300 + Math.random() * 200; // Morning peak
              else if (hour >= 14 && hour < 16) basePeople = 400 + Math.random() * 300; // Afternoon peak
              else if (hour >= 18 && hour < 20) basePeople = 500 + Math.random() * 400; // Evening peak
              else if (hour >= 6 && hour < 8) basePeople = 30 + Math.random() * 20; // Early morning
              else if (hour >= 20) basePeople = 100 + Math.random() * 50; // Late evening
              else basePeople = 150 + Math.random() * 100; // Normal hours
              
              // Weekend adjustments
              if (dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday') {
                basePeople *= 1.3; // 30% more on weekends
              }
              
              const peopleCount = Math.floor(basePeople);
              const densityPercentage = Math.min(100, (peopleCount / 1000) * 100);
              
              let densityLevel: 'low' | 'medium' | 'high' | 'critical';
              if (densityPercentage < 30) densityLevel = 'low';
              else if (densityPercentage < 60) densityLevel = 'medium';
              else if (densityPercentage < 85) densityLevel = 'high';
              else densityLevel = 'critical';

              const logTime = new Date(date);
              logTime.setHours(hour, 0, 0, 0);

              newLogs.push({
                cameraId: camera.id,
                placeName: camera.placeName,
                timestamp: logTime,
                peopleCount,
                densityPercentage,
                densityLevel,
                hour,
                dayOfWeek
              });
            }
          }
        }
      });

      setLogs(newLogs);
      generateSummaries(newLogs);
    };

    const generateSummaries = (logEntries: CrowdLogEntry[]) => {
      const summariesMap = new Map<string, CameraLogSummary>();
      
      cameras.forEach(camera => {
        if (camera.id) {
          const cameraLogs = logEntries.filter(log => log.cameraId === camera.id);
          
          if (cameraLogs.length === 0) return;

          const totalVisits = cameraLogs.length;
          const averagePeople = cameraLogs.reduce((sum, log) => sum + log.peopleCount, 0) / totalVisits;
          const peakPeople = Math.max(...cameraLogs.map(log => log.peopleCount));
          
          // Find peak time
          const hourGroups = new Map<number, number[]>();
          cameraLogs.forEach(log => {
            if (!hourGroups.has(log.hour)) {
              hourGroups.set(log.hour, []);
            }
            hourGroups.get(log.hour)!.push(log.peopleCount);
          });
          
          let peakHour = 12;
          let peakAvg = 0;
          hourGroups.forEach((counts, hour) => {
            const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
            if (avg > peakAvg) {
              peakAvg = avg;
              peakHour = hour;
            }
          });
          
          // Find quiet time
          let quietHour = 6;
          let quietAvg = Infinity;
          hourGroups.forEach((counts, hour) => {
            const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
            if (avg < quietAvg) {
              quietAvg = avg;
              quietHour = hour;
            }
          });

          // Find busiest day
          const dayGroups = new Map<string, number[]>();
          cameraLogs.forEach(log => {
            if (!dayGroups.has(log.dayOfWeek)) {
              dayGroups.set(log.dayOfWeek, []);
            }
            dayGroups.get(log.dayOfWeek)!.push(log.peopleCount);
          });
          
          let busiestDay = 'Monday';
          let busiestAvg = 0;
          dayGroups.forEach((counts, day) => {
            const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
            if (avg > busiestAvg) {
              busiestAvg = avg;
              busiestDay = day;
            }
          });

          // Generate time slot analysis
          const timeSlots: TimeSlotAnalysis[] = [];
          for (let h = 6; h < 22; h += 2) {
            const slotLogs = cameraLogs.filter(log => log.hour === h);
            if (slotLogs.length > 0) {
              const avgPeople = slotLogs.reduce((sum, log) => sum + log.peopleCount, 0) / slotLogs.length;
              const peakPeople = Math.max(...slotLogs.map(log => log.peopleCount));
              const avgDensity = slotLogs.reduce((sum, log) => sum + log.densityPercentage, 0) / slotLogs.length;
              
              timeSlots.push({
                hour: h,
                averagePeople: Math.round(avgPeople),
                peakPeople,
                averageDensity: Math.round(avgDensity),
                occurrences: slotLogs.length,
                label: `${h}:00 - ${h + 2}:00`
              });
            }
          }

          summariesMap.set(camera.id, {
            cameraId: camera.id,
            placeName: camera.placeName,
            totalVisits,
            averagePeople: Math.round(averagePeople),
            peakPeople,
            peakTime: `${peakHour}:00`,
            quietTime: `${quietHour}:00`,
            busiestDay,
            coordinates: {
              lat: camera.latitude,
              lng: camera.longitude
            },
            timeSlots
          });
        }
      });

      setSummaries(summariesMap);
    };

    generateLogs();
  }, [cameras, dateRange]);

  const filteredSummaries = selectedCamera 
    ? Array.from(summaries.values()).filter(s => s.cameraId === selectedCamera)
    : Array.from(summaries.values());

  const totalLogs = logs.length;
  const totalVisits = Array.from(summaries.values()).reduce((sum, s) => sum + s.totalVisits, 0);
  const averagePeople = summaries.size > 0
    ? Array.from(summaries.values()).reduce((sum, s) => sum + s.averagePeople, 0) / summaries.size
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
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crowd Logs</h1>
              <p className="text-gray-500 mt-1">Historical crowd data and time-based analysis</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Log Entries</p>
                <p className="text-3xl font-bold text-gray-900">{totalLogs.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Historical records</p>
              </div>
              <div className="p-3 bg-blue-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Visits</p>
                <p className="text-3xl font-bold text-gray-900">{totalVisits.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Across all locations</p>
              </div>
              <div className="p-3 bg-green-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Average People</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(averagePeople)}</p>
                <p className="text-xs text-gray-500 mt-1">Per location</p>
              </div>
              <div className="p-3 bg-purple-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Date Range:</span>
              <div className="flex gap-2">
                {(['today', 'week', 'month', 'all'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={dateRange === range ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRange(range)}
                    className={dateRange === range ? 'bg-gray-900 hover:bg-gray-800 text-white' : ''}
                  >
                    {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'All Time'}
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

      {/* Camera Log Summaries */}
      {filteredSummaries.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-lg">No log data available</p>
              <p className="text-sm text-gray-400 mt-2">
                Historical data will appear here once cameras start recording
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredSummaries.map((summary) => (
            <Card key={summary.cameraId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{summary.placeName}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs">
                          {summary.coordinates.lat.toFixed(6)}, {summary.coordinates.lng.toFixed(6)}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                    {summary.totalVisits} Records
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">Average People</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.averagePeople}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">Peak People</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.peakPeople}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">Peak Time</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.peakTime}</p>
                    <p className="text-xs text-gray-500 mt-1">Most crowded</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">Quiet Time</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.quietTime}</p>
                    <p className="text-xs text-gray-500 mt-1">Least crowded</p>
                  </div>
                </div>

                {/* Busiest Day */}
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <p className="text-sm font-semibold text-gray-700">Busiest Day</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{summary.busiestDay}</p>
                  <p className="text-xs text-gray-500 mt-1">Day with highest average crowd</p>
                </div>

                {/* Time Slot Analysis */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <CardTitle className="text-lg">Hourly Analysis</CardTitle>
                    <CardDescription>Average crowd levels by time of day</CardDescription>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {summary.timeSlots.map((slot) => (
                      <div key={slot.hour} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-2">{slot.label}</p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Avg People:</span>
                            <span className="text-sm font-bold text-gray-900">{slot.averagePeople}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Peak:</span>
                            <span className="text-sm font-semibold text-gray-900">{slot.peakPeople}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${slot.averageDensity}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{slot.averageDensity}% density</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Slot Chart */}
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-4">Crowd Pattern Visualization</p>
                  <div className="flex items-end gap-2 h-48">
                    {summary.timeSlots.map((slot) => {
                      const maxHeight = Math.max(...summary.timeSlots.map(s => s.averagePeople));
                      const height = (slot.averagePeople / maxHeight) * 100;
                      
                      return (
                        <div key={slot.hour} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-700 hover:to-blue-500"
                            style={{ height: `${height}%` }}
                            title={`${slot.label}: ${slot.averagePeople} people`}
                          ></div>
                          <p className="text-xs text-gray-600 mt-2">{slot.hour}:00</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CrowdLogs;
