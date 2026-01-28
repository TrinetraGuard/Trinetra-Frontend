import 'leaflet/dist/leaflet.css';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Timestamp, arrayRemove, arrayUnion, collection, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { AlertCircle, CheckCircle2, Clock, Eye, EyeOff, Mail, MapPin, Navigation2, Phone, User, Users, Zap } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import L from 'leaflet';
import { db } from '../../firebase/firebase';

// Fix for default markers in react-leaflet
(L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void })._getIconUrl = undefined;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Custom red marker for SOS alerts
const createSOSIcon = () => {
  return L.divIcon({
    className: 'sos-marker',
    html: `<div style="
      width: 40px;
      height: 40px;
      background: #ef4444;
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      animation: pulse 2s infinite;
    ">
      <span style="color: white; font-size: 20px;">🚨</span>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }
    </style>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Custom blue marker for volunteers
const createVolunteerIcon = () => {
  return L.divIcon({
    className: 'volunteer-marker',
    html: `<div style="
      width: 35px;
      height: 35px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">
      <span style="color: white; font-size: 16px;">👤</span>
    </div>`,
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
  });
};

interface SOSAlert {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  activatedAt: Timestamp;
  resolvedAt?: Timestamp;
  status: 'active' | 'resolved';
  latitude?: number;
  longitude?: number;
  lastLocationUpdate?: Timestamp;
  authorizedVolunteers?: string[]; // Array of volunteer UIDs with access
}

interface Volunteer {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  role?: string;
  appName?: string;
}

// Component to update map view when location changes
const MapUpdater = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  
  return null;
};

const SosAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active');
  const [newAlerts, setNewAlerts] = useState<Set<string>>(new Set());
  const mapRef = useRef<L.Map | null>(null);
  const previousAlertsRef = useRef<Set<string>>(new Set());

  // Real-time listener for SOS alerts
  useEffect(() => {
    const q = query(
      collection(db, 'sos_alerts'),
      orderBy('activatedAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SOSAlert[];
      
      // Detect new alerts
      const currentAlertIds = new Set(alertsData.map(a => a.id));
      const newAlertIds = new Set(
        Array.from(currentAlertIds).filter(id => !previousAlertsRef.current.has(id))
      );
      
      if (newAlertIds.size > 0) {
        setNewAlerts(newAlertIds);
        setTimeout(() => {
          setNewAlerts(prev => {
            const updated = new Set(prev);
            newAlertIds.forEach(id => updated.delete(id));
            return updated;
          });
        }, 5000);
      }
      
      previousAlertsRef.current = currentAlertIds;
      setAlerts(alertsData);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to SOS alerts:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for volunteers
  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('name')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const volunteersData = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() } as Volunteer))
        .filter(v => v.role === 'volunteer' && v.appName === 'Trinetra');
      
      setVolunteers(volunteersData);
    }, (error) => {
      console.error('Error listening to volunteers:', error);
    });

    return () => unsubscribe();
  }, []);

  // Auto-select first active alert if none selected
  useEffect(() => {
    if (!selectedAlert && alerts.length > 0) {
      const activeAlert = alerts.find(a => a.status === 'active');
      if (activeAlert) {
        setSelectedAlert(activeAlert);
      }
    }
  }, [alerts, selectedAlert]);

  // Real-time location updates for selected alert
  useEffect(() => {
    if (!selectedAlert || selectedAlert.status !== 'active') return;

    const alertRef = doc(db, 'sos_alerts', selectedAlert.id);
    const unsubscribe = onSnapshot(alertRef, (doc) => {
      if (doc.exists()) {
        const updatedData = { id: doc.id, ...doc.data() } as SOSAlert;
        setSelectedAlert(updatedData);
        setAlerts(prev => prev.map(a => a.id === updatedData.id ? updatedData : a));
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAlert?.id]);

  // Calculate nearest volunteers for selected alert
  const nearestVolunteers = useMemo(() => {
    if (!selectedAlert || !selectedAlert.latitude || !selectedAlert.longitude) {
      return [];
    }

    return volunteers
      .filter(v => v.latitude && v.longitude)
      .map(v => ({
        ...v,
        distance: calculateDistance(
          selectedAlert.latitude!,
          selectedAlert.longitude!,
          v.latitude!,
          v.longitude!
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10); // Top 10 nearest
  }, [selectedAlert, volunteers]);

  const handleResolveAlert = async (alertId: string) => {
    if (!window.confirm('Are you sure you want to mark this alert as resolved?')) {
      return;
    }

    try {
      await updateDoc(doc(db, 'sos_alerts', alertId), {
        status: 'resolved',
        resolvedAt: Timestamp.now(),
        authorizedVolunteers: [] // Revoke all access when resolved
      });
      
      if (selectedAlert?.id === alertId) {
        const nextActive = alerts.find(a => a.id !== alertId && a.status === 'active');
        setSelectedAlert(nextActive || null);
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
      alert('Failed to resolve alert. Please try again.');
    }
  };

  const handleGrantAccess = async (alertId: string, volunteerId: string) => {
    try {
      const alertRef = doc(db, 'sos_alerts', alertId);
      const alertDoc = await getDoc(alertRef);
      const currentAuthorized = alertDoc.data()?.authorizedVolunteers || [];
      
      if (!currentAuthorized.includes(volunteerId)) {
        await updateDoc(alertRef, {
          authorizedVolunteers: arrayUnion(volunteerId)
        });
      }
    } catch (error) {
      console.error('Error granting access:', error);
      alert('Failed to grant access. Please try again.');
    }
  };

  const handleRevokeAccess = async (alertId: string, volunteerId: string) => {
    try {
      await updateDoc(doc(db, 'sos_alerts', alertId), {
        authorizedVolunteers: arrayRemove(volunteerId)
      });
    } catch (error) {
      console.error('Error revoking access:', error);
      alert('Failed to revoke access. Please try again.');
    }
  };

  const handleAlertSelect = (alert: SOSAlert) => {
    setSelectedAlert(alert);
    setNewAlerts(prev => {
      const updated = new Set(prev);
      updated.delete(alert.id);
      return updated;
    });
  };

  // Sort alerts: active first, then by time (newest first)
  const sortedAlerts = [...alerts].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return b.activatedAt.toMillis() - a.activatedAt.toMillis();
  });

  const filteredAlerts = sortedAlerts.filter(alert => {
    if (filter === 'active') return alert.status === 'active';
    if (filter === 'resolved') return alert.status === 'resolved';
    return true;
  });

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved');

  const formatTime = (timestamp: Timestamp) => {
    return new Date(timestamp.toDate()).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (timestamp: Timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp.toDate());
    const diffInSeconds = Math.floor((now.getTime() - alertTime.getTime()) / 1000);
    
    if (diffInSeconds < 10) return 'Just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getLocationUpdateTime = (alert: SOSAlert) => {
    if (!alert.lastLocationUpdate) return 'Never';
    return getTimeAgo(alert.lastLocationUpdate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SOS Alerts</h1>
          <p className="text-gray-500 mt-1">Monitor and manage emergency alerts in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-700">{activeAlerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Resolved</p>
                  <p className="text-2xl font-bold text-green-700">{resolvedAlerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Emergency Alerts
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {filteredAlerts.length} {filter === 'all' ? 'total' : filter} alert{filteredAlerts.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={filter === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('active')}
                    className={filter === 'active' ? 'bg-red-600 hover:bg-red-700 text-white shadow-md' : 'border-gray-300'}
                  >
                    Active
                  </Button>
                  <Button
                    variant={filter === 'resolved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('resolved')}
                    className={filter === 'resolved' ? 'bg-green-600 hover:bg-green-700 text-white shadow-md' : 'border-gray-300'}
                  >
                    Resolved
                  </Button>
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                    className={filter === 'all' ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-md' : 'border-gray-300'}
                  >
                    All
                  </Button>
                </div>
              </div>
            </CardHeader>
              
            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
                {filteredAlerts.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-semibold text-lg">No {filter === 'all' ? '' : filter} alerts found</p>
                    <p className="text-sm text-gray-400 mt-2">Alerts will appear here when users activate SOS</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredAlerts.map((alert) => {
                      const isNew = newAlerts.has(alert.id);
                      const isSelected = selectedAlert?.id === alert.id;
                      
                      return (
                        <div
                          key={alert.id}
                          className={`p-4 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-gradient-to-r from-orange-50 to-orange-100/50 border-l-4 border-orange-500 shadow-sm'
                              : 'hover:bg-gray-50'
                          } ${isNew ? 'animate-pulse bg-red-50 border-l-4 border-red-500' : ''}`}
                          onClick={() => handleAlertSelect(alert)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {isNew && (
                                  <Badge className="bg-red-600 text-white animate-bounce shadow-md">
                                    <Zap className="w-3 h-3 mr-1" />
                                    NEW
                                  </Badge>
                                )}
                                <Badge
                                  variant={alert.status === 'active' ? 'destructive' : 'default'}
                                  className={`${alert.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold shadow-sm`}
                                >
                                  {alert.status === 'active' ? 'ACTIVE' : 'RESOLVED'}
                                </Badge>
                                {alert.status === 'active' && (
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
                                )}
                              </div>
                              <h3 className="font-bold text-gray-900 truncate text-base mb-1">{alert.userName}</h3>
                              <p className="text-sm text-gray-600 truncate mb-2">{alert.userEmail}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span className="font-medium">{getTimeAgo(alert.activatedAt)}</span>
                                </div>
                                {alert.status === 'active' && alert.latitude && alert.longitude && (
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span className="font-medium">{getLocationUpdateTime(alert)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {alert.status === 'active' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResolveAlert(alert.id);
                                }}
                                className="flex-shrink-0 border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700 shadow-sm"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Resolve
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map and Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAlert ? (
            <>
              {/* Alert Details Card */}
              <Card className="shadow-lg border-gray-200">
                <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50/50 border-b">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">{selectedAlert.userName}</CardTitle>
                        <CardDescription className="text-base mt-1">{selectedAlert.userEmail}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge
                        variant={selectedAlert.status === 'active' ? 'destructive' : 'default'}
                        className={`text-sm px-4 py-2 font-bold shadow-md ${
                          selectedAlert.status === 'active' 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {selectedAlert.status === 'active' ? (
                          <>
                            <AlertCircle className="w-4 h-4 mr-2" />
                            ACTIVE EMERGENCY
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            RESOLVED
                          </>
                        )}
                      </Badge>
                      {selectedAlert.status === 'active' && (
                        <Button
                          onClick={() => handleResolveAlert(selectedAlert.id)}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md font-semibold"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Phone className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Phone Number</p>
                          <p className="text-base font-bold text-gray-900">{selectedAlert.userPhone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Mail className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Email</p>
                          <p className="text-base font-bold text-gray-900">{selectedAlert.userEmail}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-200 hover:shadow-md transition-shadow">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Alert Activated</p>
                          <p className="text-base font-bold text-gray-900">
                            {formatTime(selectedAlert.activatedAt)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 font-medium">
                            {getTimeAgo(selectedAlert.activatedAt)}
                          </p>
                        </div>
                      </div>
                      {selectedAlert.resolvedAt && (
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Resolved At</p>
                            <p className="text-base font-bold text-gray-900">
                              {formatTime(selectedAlert.resolvedAt)}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedAlert.status === 'active' && selectedAlert.lastLocationUpdate && (
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Navigation2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Last Location Update</p>
                            <p className="text-base font-bold text-gray-900">
                              {getLocationUpdateTime(selectedAlert)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nearby Volunteers Card */}
              {selectedAlert.status === 'active' && selectedAlert.latitude && selectedAlert.longitude && (
                <Card className="shadow-lg border-gray-200">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold">Nearby Volunteers</CardTitle>
                          <CardDescription className="text-base mt-1">
                            Closest volunteers to the emergency location
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    {nearestVolunteers.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-semibold">No volunteers with location data available</p>
                        <p className="text-sm text-gray-400 mt-2">Volunteers will appear here when they share their location</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                        {nearestVolunteers.map((volunteer, index) => {
                          const hasAccess = selectedAlert.authorizedVolunteers?.includes(volunteer.uid) || false;
                          
                          return (
                            <div
                              key={volunteer.uid}
                              className={`flex items-center justify-between p-4 border-2 rounded-xl transition-all hover:shadow-md ${
                                hasAccess 
                                  ? 'bg-gradient-to-r from-green-50 to-green-100/50 border-green-200' 
                                  : 'bg-white border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-white shadow-md ${
                                  hasAccess ? 'bg-green-600' : 'bg-blue-600'
                                }`}>
                                  <span className="text-lg">{index + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-900 truncate text-base">
                                    {volunteer.name || 'Unknown Volunteer'}
                                  </p>
                                  <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-600 flex-wrap">
                                    <span className="font-medium">{volunteer.email}</span>
                                    <span className="flex items-center gap-1.5 font-semibold">
                                      <MapPin className="w-3.5 h-3.5" />
                                      {volunteer.distance.toFixed(2)} km away
                                    </span>
                                  </div>
                                  {hasAccess && (
                                    <Badge className="bg-green-600 hover:bg-green-700 text-white mt-2 shadow-sm">
                                      <Eye className="w-3 h-3 mr-1" />
                                      Has Access
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {hasAccess ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRevokeAccess(selectedAlert.id, volunteer.uid)}
                                    className="border-red-600 text-red-600 hover:bg-red-50 hover:border-red-700 shadow-sm font-semibold"
                                  >
                                    <EyeOff className="w-4 h-4 mr-1" />
                                    Revoke
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleGrantAccess(selectedAlert.id, volunteer.uid)}
                                    className="border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700 shadow-sm font-semibold"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Grant Access
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Map Card */}
              <Card className="overflow-hidden shadow-lg border-gray-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Live Location</CardTitle>
                      <CardDescription className="text-base mt-1">
                        {selectedAlert.latitude && selectedAlert.longitude
                          ? `Tracking user's real-time location`
                          : 'Location not available'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="h-[500px] relative bg-gray-100">
                    {selectedAlert.latitude && selectedAlert.longitude ? (
                      <>
                        <MapContainer
                          center={[selectedAlert.latitude, selectedAlert.longitude]}
                          zoom={15}
                          style={{ height: '100%', width: '100%' }}
                          className="z-0"
                          ref={(map) => {
                            if (map) mapRef.current = map;
                          }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <MapUpdater lat={selectedAlert.latitude} lng={selectedAlert.longitude} />
                          
                          {/* SOS Marker */}
                          <Marker
                            position={[selectedAlert.latitude, selectedAlert.longitude]}
                            icon={createSOSIcon()}
                          >
                            <Popup>
                              <div className="p-2">
                                <h4 className="font-semibold text-gray-900 mb-1">{selectedAlert.userName}</h4>
                                <p className="text-sm text-gray-600 mb-2">{selectedAlert.userEmail}</p>
                                <p className="text-xs text-gray-500">
                                  <strong>Last Update:</strong> {getLocationUpdateTime(selectedAlert)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  <strong>Coordinates:</strong> {selectedAlert.latitude.toFixed(6)}, {selectedAlert.longitude.toFixed(6)}
                                </p>
              </div>
                            </Popup>
                          </Marker>

                          {/* Volunteer Markers */}
                          {nearestVolunteers
                            .filter(v => v.latitude && v.longitude && selectedAlert.authorizedVolunteers?.includes(v.uid))
                            .map(volunteer => (
                              <Marker
                                key={volunteer.uid}
                                position={[volunteer.latitude!, volunteer.longitude!]}
                                icon={createVolunteerIcon()}
                              >
                                <Popup>
                                  <div className="p-2">
                                    <h4 className="font-semibold text-gray-900 mb-1">{volunteer.name || 'Volunteer'}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{volunteer.email}</p>
                                    <p className="text-xs text-gray-500">
                                      <strong>Distance:</strong> {volunteer.distance.toFixed(2)} km
                                    </p>
                                    <Badge className="bg-green-600 mt-2">
                                      <Eye className="w-3 h-3 mr-1" />
                                      Has Access
                                    </Badge>
              </div>
                                </Popup>
                              </Marker>
                            ))}
                        </MapContainer>
                        {selectedAlert.status === 'active' && (
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200 z-[1000]">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              <p className="text-sm font-medium text-gray-700">Live Tracking Active</p>
            </div>
          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 font-medium">Location not available</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Waiting for location update from user's device
                          </p>
              </div>
            </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full min-h-[600px] shadow-lg border-gray-200">
              <CardContent className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Select an Alert</h3>
                  <p className="text-gray-500 text-lg">
                    Choose an alert from the list to view details and location
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SosAlerts;
