import 'leaflet/dist/leaflet.css';

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import React, { useEffect, useRef, useState } from 'react';
import { Timestamp, collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';

import L from 'leaflet';
import { db } from '../../firebase/firebase';

// Fix for default markers in react-leaflet
(L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void })._getIconUrl = undefined;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
}

const SosAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [mapKey, setMapKey] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'sos_alerts'), orderBy('activatedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SOSAlert[];
      
      setAlerts(alertsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Force map re-render when selected alert changes
  useEffect(() => {
    if (selectedAlert) {
      setMapKey(prev => prev + 1);
      setMapLoaded(false);
      setMapError(false);
      
      // Set a timeout to detect if map fails to load
      const timeout = setTimeout(() => {
        if (!mapLoaded) {
          setMapError(true);
        }
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [selectedAlert, mapLoaded]);

  // Handle map resize when container changes
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      const timer = setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mapLoaded, selectedAlert]);

  // Map component to handle proper initialization
  const MapComponent = () => {
    if (!selectedAlert || !selectedAlert.latitude || !selectedAlert.longitude) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📍</div>
            <p>Location not available</p>
            <p className="text-sm mt-2">Latitude: {selectedAlert?.latitude || 'N/A'}</p>
            <p className="text-sm">Longitude: {selectedAlert?.longitude || 'N/A'}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full w-full">
        <MapContainer
          key={mapKey}
          center={[selectedAlert.latitude, selectedAlert.longitude]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          ref={(map) => {
            if (map) {
              mapRef.current = map;
              setMapLoaded(true);
              setMapError(false);
              // Force a resize to ensure proper rendering
              setTimeout(() => {
                map.invalidateSize();
              }, 100);
            }
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[selectedAlert.latitude, selectedAlert.longitude]}>
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold">{selectedAlert.userName}</h4>
                <p className="text-sm text-gray-600">{selectedAlert.userEmail}</p>
                <p className="text-xs text-gray-500">
                  Last updated: {selectedAlert.lastLocationUpdate ? 
                    formatTime(selectedAlert.lastLocationUpdate) : 
                    'Unknown'
                  }
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    );
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await updateDoc(doc(db, 'sos_alerts', alertId), {
        status: 'resolved',
        resolvedAt: new Date()
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const handleAlertSelect = (alert: SOSAlert) => {
    setSelectedAlert(alert);
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'active') {
      return alert.status === 'active';
    }
    if (filter === 'resolved') {
      return alert.status === 'resolved';
    }
    return true;
  });

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved');

  const formatTime = (timestamp: Timestamp) => {
    return new Date(timestamp.toDate()).toLocaleString();
  };

  const getTimeAgo = (timestamp: Timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp.toDate());
    const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    }
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    }
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'ACTIVE';
      case 'resolved': return 'RESOLVED';
      default: return 'UNKNOWN';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className=" text-gray-600">Loading SOS alerts...</p>
        </div>
      </div>
    );
  }

  // Show message if no alerts exist
  if (alerts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🚨</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">No SOS Alerts</h1>
            <p className="text-gray-600">There are currently no emergency alerts in the system.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SOS Alerts Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Monitor and manage emergency alerts</p>
            </div>
            <div className="flex space-x-4">
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {activeAlerts.length} Active
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {resolvedAlerts.length} Resolved
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Alerts List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Alerts</h2>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'resolved')}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="all">All Alerts</option>
                    <option value="active">Active Only</option>
                    <option value="resolved">Resolved Only</option>
                  </select>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {filteredAlerts.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <div className="text-4xl mb-2">🚨</div>
                    <p>No {filter === 'all' ? '' : filter} alerts found</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedAlert?.id === alert.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => handleAlertSelect(alert)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(alert.status)}`}>
                              {getStatusText(alert.status)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {getTimeAgo(alert.activatedAt)}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900">{alert.userName}</h3>
                          <p className="text-sm text-gray-600">{alert.userEmail}</p>
                          <p className="text-xs text-gray-500">{alert.userPhone}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {formatTime(alert.activatedAt)}
                          </div>
                          {alert.status === 'active' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResolveAlert(alert.id);
                              }}
                              className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Map and Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow" style={{ height: '600px' }}>
              {selectedAlert ? (
                <div className="h-full flex flex-col">
                  {/* Alert Details Header */}
                  <div className="p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {selectedAlert.userName}
                        </h3>
                        <p className="text-sm text-gray-600">{selectedAlert.userEmail}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(selectedAlert.status)}`}>
                          {getStatusText(selectedAlert.status)}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Alerted {getTimeAgo(selectedAlert.activatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Map */}
                  <div className="flex-1 relative" style={{ minHeight: '300px' }}>
                    {!mapLoaded && selectedAlert && !mapError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-600">Loading map...</p>
                        </div>
                      </div>
                    )}
                    {mapError && selectedAlert && (
                      <div className="h-full flex items-center justify-center text-red-500">
                        <div className="text-center">
                          <div className="text-4xl mb-2">⚠️</div>
                          <p>Failed to load map</p>
                          <button 
                            onClick={() => {
                              setMapError(false);
                              setMapKey(prev => prev + 1);
                            }}
                            className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Retry
                          </button>
                        </div>
                      </div>
                    )}
                    <MapComponent />
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p><strong>Phone:</strong> {selectedAlert.userPhone}</p>
                        <p><strong>Alerted:</strong> {formatTime(selectedAlert.activatedAt)}</p>
                        {selectedAlert.resolvedAt && (
                          <p><strong>Resolved:</strong> {formatTime(selectedAlert.resolvedAt)}</p>
                        )}
                      </div>
                      {selectedAlert.status === 'active' && (
                        <button
                          onClick={() => handleResolveAlert(selectedAlert.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                          Mark as Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">👆</div>
                    <p>Select an alert to view details and location</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">{activeAlerts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">{resolvedAlerts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">{alerts.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SosAlerts;
