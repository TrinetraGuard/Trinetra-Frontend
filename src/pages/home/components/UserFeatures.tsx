import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    MapPin,
    Navigation,
    Phone,
    Search
} from "lucide-react";

import { motion } from "framer-motion";
import React from "react";

const UserFeatures: React.FC = () => {
  const features = [
    {
      id: 1,
      title: "Smart Roadmap & Timeline",
      description: "Get optimized routes and visit plans based on your timeline and preferences",
      icon: Navigation,
      color: "from-blue-500 to-cyan-500",
      details: [
        "Personalized visit schedules",
        "Real-time route optimization",
        "Time-based recommendations",
        "Interactive maps with directions"
      ]
    },
    {
      id: 2,
      title: "Lost & Found System",
      description: "Report missing persons and find lost family members quickly and efficiently",
      icon: Search,
      color: "from-orange-500 to-red-500",
      details: [
        "Instant missing person reports",
        "AI-powered face recognition",
        "Real-time search updates",
        "Emergency contact integration"
      ]
    },
    {
      id: 3,
      title: "Essential Services Locator",
      description: "Find nearby essential services like medical, food, and accommodation",
      icon: MapPin,
      color: "from-green-500 to-emerald-500",
      details: [
        "Medical facilities nearby",
        "Food and water locations",
        "Accommodation options",
        "Transportation services"
      ]
    },
    {
      id: 4,
      title: "24/7 Helpline & Support",
      description: "Round-the-clock support for any emergency or assistance needed",
      icon: Phone,
      color: "from-purple-500 to-pink-500",
      details: [
        "Emergency hotlines",
        "Multi-language support",
        "Direct authority contact",
        "Real-time assistance"
      ]
    },
    {
      id: 5,
      title: "Event & Place Information",
      description: "Comprehensive details about events, timings, and places to visit",
      icon: Calendar,
      color: "from-indigo-500 to-blue-500",
      details: [
        "Event schedules and timings",
        "Historical place information",
        "Crowd predictions",
        "Best visiting hours"
      ]
    },
    {
      id: 6,
      title: "SOS Emergency Response",
      description: "Immediate emergency response system for critical situations",
      icon: AlertTriangle,
      color: "from-red-500 to-orange-500",
      details: [
        "One-tap emergency alert",
        "GPS location sharing",
        "Direct emergency services",
        "Family notification system"
      ]
    }
  ];

  return (
    <section className="py-20 bg-gray-900/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need for a <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Safe Pilgrimage</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and information you need to make your spiritual journey safe, organized, and memorable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/10 hover:border-orange-500/30 group"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">{feature.description}</p>
              <ul className="space-y-3">
                {feature.details.map((detail, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-sm">{detail}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserFeatures;
