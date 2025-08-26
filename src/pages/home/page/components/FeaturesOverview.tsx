import { BarChart3, Bell, Brain, Camera, Shield, Smartphone, Users, Zap } from 'lucide-react';

import { motion } from 'framer-motion';

const FeaturesOverview = () => {
  const features = [
    {
      icon: Camera,
      title: "24/7 AI Monitoring",
      description: "Advanced computer vision continuously watches all areas, providing real-time people counting with 95% accuracy",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Brain,
      title: "Predictive Intelligence",
      description: "AI algorithms analyze patterns to predict crowd surges 30 minutes before they happen, giving you time to prepare",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: BarChart3,
      title: "Smart Capacity Management",
      description: "Set custom capacity limits for each area and get intelligent recommendations based on historical data",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Bell,
      title: "Multi-Level Alerts",
      description: "Receive warnings at 70%, alerts at 85%, and critical notifications at 95% capacity with instant mobile push notifications",
      color: "from-red-500 to-red-600"
    },
    {
      icon: Users,
      title: "Volunteer Coordination",
      description: "Automatically notify and coordinate nearby volunteers with real-time location tracking and task assignment",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Smartphone,
      title: "Mobile Command Center",
      description: "Full system control from your phone - view cameras, manage alerts, and coordinate responses on the go",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const userBenefits = [
    {
      icon: Shield,
      title: "Enhanced Safety",
      description: "Prevent accidents and stampedes with proactive crowd management",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Zap,
      title: "Faster Response",
      description: "Reduce response time from minutes to seconds with automated alert systems",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: Users,
      title: "Better Experience",
      description: "Ensure smooth flow and comfortable experience for all visitors",
      color: "from-blue-500 to-blue-600"
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
            Complete Crowd Management
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              {" "}Solution
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to manage crowds safely and efficiently - from monitoring to response
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-orange-500/30 transition-all duration-300 h-full">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* User Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-white mb-4">What You Get</h3>
            <p className="text-gray-300 max-w-2xl mx-auto">Experience these key benefits with our crowd management system</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {userBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`w-20 h-20 bg-gradient-to-r ${benefit.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <benefit.icon className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-white font-semibold text-xl mb-3">{benefit.title}</h4>
                <p className="text-gray-400">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Workflow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Your Complete Workflow
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Setup</h4>
                <p className="text-gray-400 text-sm">Configure cameras and set capacity limits for each area</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Monitor</h4>
                <p className="text-gray-400 text-sm">AI continuously watches and counts people in real-time</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Analyze</h4>
                <p className="text-gray-400 text-sm">System predicts potential issues before they occur</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">4</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Alert</h4>
                <p className="text-gray-400 text-sm">Get instant notifications on your mobile device</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">5</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Respond</h4>
                <p className="text-gray-400 text-sm">Coordinate volunteers and manage the situation effectively</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesOverview;
