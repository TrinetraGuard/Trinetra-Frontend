import { Bell, MapPin, MessageSquare, Phone, Shield, Users } from 'lucide-react';

import { motion } from 'framer-motion';

const VolunteerCoordination = () => {
  const volunteerFeatures = [
    {
      icon: Bell,
      title: "Instant Alerts",
      description: "Volunteers receive immediate notifications with person details and location",
      details: ["Push notifications", "SMS alerts", "App notifications", "Emergency calls"]
    },
    {
      icon: MapPin,
      title: "Location Sharing",
      description: "Precise location coordinates and area mapping for quick response",
      details: ["GPS coordinates", "Area mapping", "Route guidance", "Distance calculation"]
    },
    {
      icon: Users,
      title: "Team Coordination",
      description: "Multiple volunteers can coordinate and share information in real-time",
      details: ["Group chat", "Status updates", "Task assignment", "Progress tracking"]
    },
    {
      icon: Shield,
      title: "Safe Handover",
      description: "Secure process for identifying and escorting found persons to centers",
      details: ["Identity verification", "Safe escort", "Center handover", "Family notification"]
    }
  ];

  const coordinationSteps = [
    {
      step: 1,
      title: "Alert Received",
      description: "Volunteer gets notification with person details and location",
      icon: Bell,
      color: "bg-red-500"
    },
    {
      step: 2,
      title: "Location Analysis",
      description: "Review camera location and plan fastest route",
      icon: MapPin,
      color: "bg-blue-500"
    },
    {
      step: 3,
      title: "Person Search",
      description: "Search area and identify the missing person",
      icon: Users,
      color: "bg-green-500"
    },
    {
      step: 4,
      title: "Safe Escort",
      description: "Escort person to nearest help center",
      icon: Shield,
      color: "bg-orange-500"
    },
    {
      step: 5,
      title: "Family Contact",
      description: "Notify family and coordinate reunion",
      icon: Phone,
      color: "bg-purple-500"
    }
  ];

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
            Volunteer
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              {" "}Coordination
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Efficient volunteer network with real-time communication and coordinated response for quick person recovery
          </p>
        </motion.div>

        {/* Volunteer Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {volunteerFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-orange-500/30 transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-8 h-8 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-xl mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {feature.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">{detail}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coordination Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Volunteer Response Process
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {coordinationSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">{step.title}</h4>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                  {index < coordinationSteps.length - 1 && (
                    <div className="hidden md:block w-full h-0.5 bg-orange-500/30 mt-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Volunteer Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Alert Details */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-400" />
              Active Alert Details
            </h3>
            
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold">Missing Person Alert</h4>
                  <span className="text-red-400 text-sm">URGENT</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">Rajesh Kumar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Age:</span>
                    <span className="text-white">65 years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Seen:</span>
                    <span className="text-white">Temple Area - Camera 12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time:</span>
                    <span className="text-white">2 minutes ago</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg px-4 py-2 text-orange-400 text-sm transition-all duration-300">
                  <Phone className="w-4 h-4" />
                  Call Family
                </button>
                <button className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 text-sm transition-all duration-300">
                  <MessageSquare className="w-4 h-4" />
                  Send Update
                </button>
              </div>
            </div>
          </div>

          {/* Location & Team */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-400" />
              Location & Team
            </h3>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">Camera Location</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Camera ID:</span>
                    <span className="text-white">CAM-012</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Area:</span>
                    <span className="text-white">Temple Complex</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Coordinates:</span>
                    <span className="text-white">19.0760° N, 72.8777° E</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">Nearby Volunteers</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Priya Singh</span>
                    <span className="text-green-400 text-xs">2 min away</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Amit Patel</span>
                    <span className="text-yellow-400 text-xs">5 min away</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Suresh Kumar</span>
                    <span className="text-blue-400 text-xs">En route</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Communication Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <h3 className="text-white font-semibold text-2xl mb-6 text-center">Communication Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Direct Calls</h4>
                <p className="text-gray-400 text-sm">Instant voice communication with family and team members</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Team Chat</h4>
                <p className="text-gray-400 text-sm">Real-time messaging for coordination and updates</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-orange-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Push Notifications</h4>
                <p className="text-gray-400 text-sm">Instant alerts for urgent situations and updates</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VolunteerCoordination;
