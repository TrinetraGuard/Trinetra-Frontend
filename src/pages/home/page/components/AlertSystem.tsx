import { AlertTriangle, Bell, Clock, MapPin, MessageSquare, Phone, Shield, Users, Zap } from 'lucide-react';

import { motion } from 'framer-motion';
import { useState } from 'react';

const AlertSystem = () => {
  const [activeAlerts] = useState([
    {
      id: 1,
      area: 'Food Court',
      type: 'critical',
      message: 'Capacity limit reached - Immediate action required',
      currentCount: 423,
      maxCapacity: 400,
      timestamp: '2 minutes ago',
      volunteers: [
        { id: 1, name: 'Rajesh Kumar', phone: '+91 98765 43210', status: 'en-route', eta: '5 min' },
        { id: 2, name: 'Priya Singh', phone: '+91 98765 43211', status: 'on-site', eta: '0 min' }
      ]
    },
    {
      id: 2,
      area: 'Temple Area',
      type: 'warning',
      message: 'Approaching capacity limit - Monitor closely',
      currentCount: 892,
      maxCapacity: 1000,
      timestamp: '5 minutes ago',
      volunteers: [
        { id: 3, name: 'Amit Patel', phone: '+91 98765 43212', status: 'standby', eta: '10 min' }
      ]
    }
  ]);

  const alertLevels = [
    {
      level: 'Info',
      threshold: '50%',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      description: 'Normal crowd levels - no action needed'
    },
    {
      level: 'Warning',
      threshold: '70%',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      description: 'Crowd building up - prepare volunteers'
    },
    {
      level: 'Alert',
      threshold: '85%',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      description: 'High capacity - deploy volunteers'
    },
    {
      level: 'Critical',
      threshold: '95%',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      description: 'Maximum capacity - immediate action required'
    }
  ];

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500/50 bg-red-500/10';
      case 'warning': return 'border-yellow-500/50 bg-yellow-500/10';
      default: return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getVolunteerStatusColor = (status: string) => {
    switch (status) {
      case 'on-site': return 'text-green-400';
      case 'en-route': return 'text-blue-400';
      case 'standby': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
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
            Intelligent
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              {" "}Alert System
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get notified at the right time with smart alerts that help you respond before situations become critical
          </p>
        </motion.div>

        {/* Alert Levels Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white text-center mb-8">How Our Alert System Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {alertLevels.map((level, index) => (
                <div key={index} className={`p-6 rounded-xl border ${level.bgColor} ${level.borderColor}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${level.color.replace('text-', 'bg-')}`}></div>
                    <h4 className={`font-semibold ${level.color}`}>{level.level}</h4>
                  </div>
                  <p className="text-white font-bold text-lg mb-2">{level.threshold}</p>
                  <p className="text-gray-400 text-sm">{level.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Alerts */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-400" />
                Active Alerts
              </h3>
              
              {activeAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No active alerts</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                      viewport={{ once: true }}
                      className={`p-4 rounded-xl border ${getAlertColor(alert.type)}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`w-5 h-5 ${getAlertIcon(alert.type)}`} />
                          <div>
                            <h4 className="text-white font-semibold">{alert.area}</h4>
                            <p className="text-gray-400 text-sm">{alert.message}</p>
                          </div>
                        </div>
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {alert.timestamp}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-orange-400" />
                          <span className="text-white font-semibold">{alert.currentCount}</span>
                          <span className="text-gray-400">/ {alert.maxCapacity}</span>
                        </div>
                        <span className={`text-sm font-medium ${getAlertIcon(alert.type)}`}>
                          {Math.round((alert.currentCount / alert.maxCapacity) * 100)}% Full
                        </span>
                      </div>

                      <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            alert.type === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.round((alert.currentCount / alert.maxCapacity) * 100)}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Volunteers:</span>
                        {alert.volunteers.map((volunteer) => (
                          <span 
                            key={volunteer.id}
                            className={`text-xs px-2 py-1 rounded-full ${getVolunteerStatusColor(volunteer.status)} bg-white/10`}
                          >
                            {volunteer.name} ({volunteer.status})
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Volunteer Coordination */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-400" />
                Volunteer Coordination
              </h3>
              
              <div className="space-y-4">
                {activeAlerts.flatMap(alert => alert.volunteers).map((volunteer) => (
                  <motion.div
                    key={volunteer.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    viewport={{ once: true }}
                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-semibold">{volunteer.name}</h4>
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {volunteer.status === 'on-site' ? 'At location' : 
                           volunteer.status === 'en-route' ? 'En route' : 'Standby'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${getVolunteerStatusColor(volunteer.status)}`}>
                          {volunteer.status}
                        </span>
                        <p className="text-gray-400 text-xs">ETA: {volunteer.eta}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg px-3 py-2 text-orange-400 text-sm transition-all duration-300">
                        <Phone className="w-4 h-4" />
                        Call
                      </button>
                      <button className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-3 py-2 text-blue-400 text-sm transition-all duration-300">
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Alert Features */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold text-xl mb-6">Alert Features</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-orange-400" />
                  <div>
                    <h4 className="text-white font-medium">Instant Notifications</h4>
                    <p className="text-gray-400 text-sm">Get alerts on your phone within seconds</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-orange-400" />
                  <div>
                    <h4 className="text-white font-medium">Predictive Alerts</h4>
                    <p className="text-gray-400 text-sm">Warnings before capacity is reached</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-orange-400" />
                  <div>
                    <h4 className="text-white font-medium">Auto-Coordination</h4>
                    <p className="text-gray-400 text-sm">Volunteers notified automatically</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Statistics */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold text-xl mb-6">Alert Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-white font-bold text-2xl">2</p>
                  <p className="text-gray-400 text-sm">Active Alerts</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-white font-bold text-2xl">4</p>
                  <p className="text-gray-400 text-sm">Volunteers Deployed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AlertSystem;
