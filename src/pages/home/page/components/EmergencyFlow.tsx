import { Camera, CheckCircle, MapPin, Shield, Users, Zap } from "lucide-react";

import { motion } from "framer-motion";

const EmergencyFlow = () => {
  const flowSteps = [
    {
      id: 1,
      title: "Emergency Detection",
      description: "AI-powered CCTV cameras and user reports identify emergency situations in real-time",
      icon: Camera,
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      details: [
        "Live CCTV monitoring",
        "AI behavior analysis",
        "User emergency reports",
        "Volunteer alerts"
      ]
    },
    {
      id: 2,
      title: "Instant Alert System",
      description: "Automated notifications sent to nearest volunteers, medical teams, and administrators",
      icon: Zap,
      color: "from-orange-500 to-yellow-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      details: [
        "Real-time notifications",
        "Multi-channel alerts",
        "Priority-based routing",
        "Location tracking"
      ]
    },
    {
      id: 3,
      title: "Volunteer Dispatch",
      description: "Nearest available volunteers are automatically assigned and dispatched to the location",
      icon: Users,
      color: "from-yellow-500 to-green-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      details: [
        "Smart volunteer matching",
        "Real-time availability",
        "Skill-based assignment",
        "Route optimization"
      ]
    },
    {
      id: 4,
      title: "Medical Coordination",
      description: "Nearest medical facilities are notified and prepared for incoming emergency cases",
      icon: Shield,
      color: "from-green-500 to-blue-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      details: [
        "Medical facility mapping",
        "Capacity assessment",
        "Specialist availability",
        "Emergency preparation"
      ]
    },
    {
      id: 5,
      title: "Smart Route Planning",
      description: "AI analyzes traffic and crowd density to find the fastest, safest route to medical care",
      icon: MapPin,
      color: "from-blue-500 to-purple-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      details: [
        "Traffic analysis",
        "Crowd density mapping",
        "Alternative routes",
        "Real-time updates"
      ]
    },
    {
      id: 6,
      title: "Emergency Resolution",
      description: "Complete emergency response with follow-up care and situation documentation",
      icon: CheckCircle,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      details: [
        "Medical treatment",
        "Situation documentation",
        "Follow-up care",
        "Response evaluation"
      ]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(239,68,68,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(251,146,60,0.05),transparent_50%)]"></div>
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
            Complete Emergency
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"> Response Flow</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our AI-powered system ensures rapid emergency detection, response, and resolution through a comprehensive 6-step process
          </p>
        </motion.div>

        {/* Flow Steps */}
        <div className="space-y-12">
          {flowSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-12`}
            >
              {/* Step Content */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-400">Step {step.id}</span>
                      <div className="w-8 h-1 bg-gradient-to-r from-gray-600 to-gray-400 rounded-full"></div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">{step.title}</h3>
                  </div>
                </div>
                
                <p className="text-lg text-gray-300 leading-relaxed">
                  {step.description}
                </p>

                {/* Step Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {step.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-center gap-3">
                      <div className={`w-2 h-2 bg-gradient-to-r ${step.color} rounded-full`}></div>
                      <span className="text-gray-300">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Visual */}
              <div className={`flex-1 ${step.bgColor} ${step.borderColor} border-2 rounded-2xl p-8 backdrop-blur-sm`}>
                <div className="text-center space-y-4">
                  <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto shadow-lg`}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-white">{step.title}</h4>
                  <div className="space-y-2">
                    {step.details.slice(0, 2).map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center justify-center gap-2 text-sm text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Flow Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-4">
              Complete Emergency Response in <span className="text-orange-400">Under 5 Minutes</span>
            </h3>
            <p className="text-gray-300 text-lg">
              From detection to medical care, our system ensures rapid response times with AI-powered optimization
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EmergencyFlow;
