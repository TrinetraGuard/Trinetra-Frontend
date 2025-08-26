import { AlertTriangle, Clock, Phone, Shield, Users } from "lucide-react";

import { motion } from "framer-motion";
import { useState } from "react";

const EmergencyResponse = () => {
  const [activeScenario, setActiveScenario] = useState(0);

  const scenarios = [
    {
      id: 1,
      title: "CCTV Detection",
      description: "AI-powered cameras detect emergency situation",
      icon: AlertTriangle,
      color: "from-red-500 to-orange-500",
      steps: [
        {
          time: "00:00",
          action: "CCTV camera detects unusual activity",
          status: "Detected",
          details: "AI algorithm identifies potential emergency situation"
        },
        {
          time: "00:05",
          action: "System analyzes and confirms emergency",
          status: "Confirmed",
          details: "Multiple AI models validate the emergency situation"
        },
        {
          time: "00:10",
          action: "Alerts sent to nearest volunteers",
          status: "Alerted",
          details: "Real-time notifications to 3 nearest volunteers"
        },
        {
          time: "00:15",
          action: "Medical facilities notified",
          status: "Notified",
          details: "Nearest hospital and medical teams alerted"
        },
        {
          time: "00:30",
          action: "Volunteers arrive at scene",
          status: "On Scene",
          details: "First responders reach the location"
        },
        {
          time: "01:00",
          action: "Medical care provided",
          status: "Resolved",
          details: "Patient receives immediate medical attention"
        }
      ]
    },
    {
      id: 2,
      title: "User Report",
      description: "Emergency reported by user or volunteer",
      icon: Phone,
      color: "from-orange-500 to-yellow-500",
      steps: [
        {
          time: "00:00",
          action: "User reports emergency via app",
          status: "Reported",
          details: "Emergency situation reported through mobile app"
        },
        {
          time: "00:10",
          action: "Admin receives notification",
          status: "Received",
          details: "Administrator reviews and validates report"
        },
        {
          time: "00:20",
          action: "Volunteers dispatched",
          status: "Dispatched",
          details: "Nearest available volunteers assigned"
        },
        {
          time: "00:35",
          action: "Route optimization calculated",
          status: "Optimized",
          details: "AI determines fastest route avoiding crowds"
        },
        {
          time: "00:50",
          action: "Medical coordination initiated",
          status: "Coordinated",
          details: "Medical facilities prepared for incoming case"
        },
        {
          time: "01:15",
          action: "Emergency resolved",
          status: "Resolved",
          details: "Complete emergency response completed"
        }
      ]
    },
    {
      id: 3,
      title: "Volunteer Alert",
      description: "Volunteer witnesses emergency situation",
      icon: Users,
      color: "from-yellow-500 to-green-500",
      steps: [
        {
          time: "00:00",
          action: "Volunteer witnesses emergency",
          status: "Witnessed",
          details: "Trained volunteer identifies emergency situation"
        },
        {
          time: "00:05",
          action: "Immediate response initiated",
          status: "Responding",
          details: "Volunteer begins immediate assistance"
        },
        {
          time: "00:10",
          action: "Backup requested",
          status: "Requested",
          details: "Additional volunteers and medical support requested"
        },
        {
          time: "00:20",
          action: "Medical team dispatched",
          status: "Dispatched",
          details: "Professional medical team en route"
        },
        {
          time: "00:40",
          action: "Medical care provided",
          status: "Treating",
          details: "Professional medical care administered"
        },
        {
          time: "01:00",
          action: "Situation stabilized",
          status: "Stabilized",
          details: "Patient condition stabilized and monitored"
        }
      ]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,rgba(239,68,68,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(251,146,60,0.05),transparent_50%)]"></div>
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
            Real-Time Emergency
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"> Response</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See how our system responds to different types of emergency situations with precise timing and coordination
          </p>
        </motion.div>

        {/* Scenario Selector */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row gap-4 justify-center mb-12"
        >
          {scenarios.map((scenario, index) => (
            <button
              key={scenario.id}
              onClick={() => setActiveScenario(index)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                activeScenario === index
                  ? `bg-gradient-to-r ${scenario.color} text-white shadow-lg`
                  : "bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 hover:bg-white/10"
              }`}
            >
              <scenario.icon className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold">{scenario.title}</div>
                <div className="text-sm opacity-80">{scenario.description}</div>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Response Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-8 backdrop-blur-sm">
            <div className="space-y-6">
              {scenarios[activeScenario].steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-6"
                >
                  {/* Time */}
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold rounded-lg px-3 py-1">
                      {step.time}
                    </div>
                  </div>

                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 bg-gradient-to-r ${scenarios[activeScenario].color} rounded-full shadow-lg`}></div>
                    {index < scenarios[activeScenario].steps.length - 1 && (
                      <div className="w-0.5 h-12 bg-gradient-to-b from-red-500/50 to-orange-500/50 mt-2"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-white">{step.action}</h4>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        step.status === "Resolved" || step.status === "Stabilized"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : step.status === "Detected" || step.status === "Reported" || step.status === "Witnessed"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      }`}>
                        {step.status}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{step.details}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Response Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Clock className="w-8 h-8 text-orange-400 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">Average Response Time</h4>
              <p className="text-2xl font-bold text-orange-400">1-2 minutes</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Shield className="w-8 h-8 text-green-400 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">Success Rate</h4>
              <p className="text-2xl font-bold text-green-400">99.8%</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">Active Volunteers</h4>
              <p className="text-2xl font-bold text-blue-400">500+</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EmergencyResponse;
