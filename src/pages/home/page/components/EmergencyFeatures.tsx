import { Brain, Clock, Eye, MapPin, Shield, Smartphone, Users, Wifi, Zap } from "lucide-react";

import { motion } from "framer-motion";

const EmergencyFeatures = () => {
  const features = [
    {
      icon: Eye,
      title: "AI-Powered Detection",
      description: "Advanced computer vision algorithms detect emergency situations through CCTV cameras in real-time",
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      details: [
        "Behavioral analysis",
        "Anomaly detection",
        "Facial recognition",
        "Gesture recognition"
      ]
    },
    {
      icon: Zap,
      title: "Instant Notifications",
      description: "Real-time alerts sent to volunteers, medical teams, and administrators within seconds",
      color: "from-orange-500 to-yellow-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      details: [
        "Multi-channel alerts",
        "Priority routing",
        "Location tracking",
        "Status updates"
      ]
    },
    {
      icon: Users,
      title: "Smart Volunteer Management",
      description: "Intelligent matching of volunteers based on location, skills, and availability",
      color: "from-yellow-500 to-green-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      details: [
        "Skill-based assignment",
        "Real-time availability",
        "Performance tracking",
        "Training management"
      ]
    },
    {
      icon: MapPin,
      title: "Route Optimization",
      description: "AI analyzes traffic and crowd density to find the fastest route to medical facilities",
      color: "from-green-500 to-blue-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      details: [
        "Traffic analysis",
        "Crowd density mapping",
        "Alternative routes",
        "Real-time updates"
      ]
    },
    {
      icon: Shield,
      title: "Medical Coordination",
      description: "Seamless coordination with medical facilities for immediate care and treatment",
      color: "from-blue-500 to-purple-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      details: [
        "Facility mapping",
        "Capacity assessment",
        "Specialist availability",
        "Emergency preparation"
      ]
    },
    {
      icon: Brain,
      title: "Predictive Analytics",
      description: "Machine learning models predict potential emergencies and optimize response strategies",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      details: [
        "Risk assessment",
        "Pattern recognition",
        "Resource optimization",
        "Performance analysis"
      ]
    }
  ];

  const keyStats = [
    {
      icon: Clock,
      title: "Response Time",
      value: "< 2 min",
      description: "Average emergency response time"
    },
    {
      icon: Users,
      title: "Active Volunteers",
      value: "500+",
      description: "Trained emergency responders"
    },
    {
      icon: MapPin,
      title: "Coverage Area",
      value: "100%",
      description: "Complete pilgrimage site coverage"
    },
    {
      icon: Shield,
      title: "Success Rate",
      value: "99.8%",
      description: "Emergency resolution success rate"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-800 via-gray-900 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(239,68,68,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(251,146,60,0.05),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Advanced Emergency
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"> Features</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Cutting-edge technology ensures rapid, efficient, and coordinated emergency response
          </p>
        </motion.div>

        {/* Key Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {keyStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-orange-400 mb-1">{stat.title}</div>
                <div className="text-xs text-gray-400">{stat.description}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`${feature.bgColor} ${feature.borderColor} border-2 rounded-2xl p-6 backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">{feature.description}</p>
              
              <div className="space-y-2">
                {feature.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="flex items-center gap-3">
                    <div className={`w-2 h-2 bg-gradient-to-r ${feature.color} rounded-full`}></div>
                    <span className="text-sm text-gray-300">{detail}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Powered by Advanced Technology
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="text-white font-semibold">AI/ML</div>
                <div className="text-gray-400 text-sm">Machine Learning</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <div className="text-white font-semibold">Computer Vision</div>
                <div className="text-gray-400 text-sm">Real-time Analysis</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <div className="text-white font-semibold">Mobile Apps</div>
                <div className="text-gray-400 text-sm">Instant Alerts</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wifi className="w-8 h-8 text-white" />
                </div>
                <div className="text-white font-semibold">IoT Network</div>
                <div className="text-gray-400 text-sm">Connected Devices</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EmergencyFeatures;
