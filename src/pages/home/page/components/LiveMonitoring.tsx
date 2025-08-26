import { AlertTriangle, Camera, Eye, TrendingUp, Users, Wifi } from 'lucide-react';

import { motion } from 'framer-motion';
import { useState } from 'react';

const LiveMonitoring = () => {
  const [selectedArea, setSelectedArea] = useState('main-gate');

  const cameraFeeds = [
    {
      id: 'main-gate',
      name: 'Main Gate',
      currentCount: 247,
      maxCapacity: 500,
      status: 'active',
      location: 'North Entrance',
      trend: 'stable',
      lastUpdate: '2 seconds ago'
    },
    {
      id: 'temple-area',
      name: 'Temple Area',
      currentCount: 892,
      maxCapacity: 1000,
      status: 'warning',
      location: 'Central Complex',
      trend: 'increasing',
      lastUpdate: '5 seconds ago'
    },
    {
      id: 'parking-lot',
      name: 'Parking Lot',
      currentCount: 156,
      maxCapacity: 300,
      status: 'active',
      location: 'East Side',
      trend: 'stable',
      lastUpdate: '1 second ago'
    },
    {
      id: 'food-court',
      name: 'Food Court',
      currentCount: 423,
      maxCapacity: 400,
      status: 'critical',
      location: 'South Area',
      trend: 'decreasing',
      lastUpdate: '3 seconds ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'decreasing': return <TrendingUp className="w-4 h-4 text-green-400 rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const getCapacityPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Real-Time
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              {" "}Monitoring Dashboard
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See exactly what's happening in every area with live camera feeds and instant crowd analytics
          </p>
        </motion.div>

        {/* Key Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
              <Eye className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold text-lg mb-2">Live Camera Feeds</h3>
              <p className="text-gray-400 text-sm">View real-time video from all monitored areas with AI overlay</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
              <Users className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold text-lg mb-2">People Counting</h3>
              <p className="text-gray-400 text-sm">Accurate real-time count with trend analysis and predictions</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
              <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold text-lg mb-2">Smart Alerts</h3>
              <p className="text-gray-400 text-sm">Get notified instantly when areas approach or exceed capacity</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera Feeds List */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
                <Camera className="w-5 h-5 text-orange-400" />
                Active Areas
              </h3>
              <div className="space-y-4">
                {cameraFeeds.map((feed) => (
                  <motion.div
                    key={feed.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    viewport={{ once: true }}
                    onClick={() => setSelectedArea(feed.id)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 ${
                      selectedArea === feed.id 
                        ? 'bg-orange-500/20 border-orange-500/50' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{feed.name}</h4>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(feed.status)}`}></div>
                        {getTrendIcon(feed.trend)}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{feed.location}</p>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-orange-400" />
                        <span className="text-white font-semibold">{feed.currentCount}</span>
                        <span className="text-gray-400">/ {feed.maxCapacity}</span>
                      </div>
                      <span className={`text-sm font-medium ${getStatusColor(feed.status)}`}>
                        {getCapacityPercentage(feed.currentCount, feed.maxCapacity)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          feed.status === 'critical' ? 'bg-red-500' :
                          feed.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${getCapacityPercentage(feed.currentCount, feed.maxCapacity)}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-500 text-xs">Updated: {feed.lastUpdate}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Feed Display */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-xl flex items-center gap-2">
                  <Eye className="w-5 h-5 text-orange-400" />
                  Live Feed - {cameraFeeds.find(f => f.id === selectedArea)?.name}
                </h3>
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">LIVE</span>
                </div>
              </div>

              {/* Camera Feed Placeholder */}
              <div className="relative bg-black rounded-xl overflow-hidden mb-6">
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg font-medium">
                      {cameraFeeds.find(f => f.id === selectedArea)?.name} - Live Feed
                    </p>
                    <p className="text-gray-500 text-sm mt-2">Real-time CCTV stream with AI people counting overlay</p>
                  </div>
                </div>
                
                {/* AI Overlay Stats */}
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-2 text-white">
                    <Users className="w-4 h-4 text-orange-400" />
                    <span className="font-semibold">
                      {cameraFeeds.find(f => f.id === selectedArea)?.currentCount}
                    </span>
                    <span className="text-gray-400 text-sm">people</span>
                  </div>
                </div>

                {/* Connection Status */}
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center gap-2 text-green-400">
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                </div>

                {/* AI Detection Boxes */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-8 h-16 border-2 border-green-400 rounded"></div>
                  <div className="absolute top-1/3 right-1/3 w-6 h-12 border-2 border-green-400 rounded"></div>
                  <div className="absolute bottom-1/4 left-1/3 w-10 h-20 border-2 border-green-400 rounded"></div>
                </div>
              </div>

              {/* Area Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-gray-400 text-sm mb-2">Current Count</h4>
                  <p className="text-white font-bold text-2xl">
                    {cameraFeeds.find(f => f.id === selectedArea)?.currentCount}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-gray-400 text-sm mb-2">Max Capacity</h4>
                  <p className="text-white font-bold text-2xl">
                    {cameraFeeds.find(f => f.id === selectedArea)?.maxCapacity}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-gray-400 text-sm mb-2">Utilization</h4>
                  <p className="text-white font-bold text-2xl">
                    {getCapacityPercentage(
                      cameraFeeds.find(f => f.id === selectedArea)?.currentCount || 0,
                      cameraFeeds.find(f => f.id === selectedArea)?.maxCapacity || 1
                    )}%
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-gray-400 text-sm mb-2">Status</h4>
                  <p className={`font-bold text-lg ${getStatusColor(cameraFeeds.find(f => f.id === selectedArea)?.status || '')}`}>
                    {cameraFeeds.find(f => f.id === selectedArea)?.status?.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4">
                <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
                  View Full Screen
                </button>
                <button className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-semibold py-3 px-6 rounded-xl transition-all duration-300">
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveMonitoring;
