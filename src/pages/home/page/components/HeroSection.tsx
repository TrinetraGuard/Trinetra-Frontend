import { Activity, AlertTriangle, Eye, Shield, Smartphone, Users } from 'lucide-react';

import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,48,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Smart
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                {" "}Crowd Management
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Experience seamless crowd control with AI-powered monitoring, real-time alerts, and coordinated response systems for safe pilgrimage management
            </p>
          </motion.div>

          {/* User Journey Flow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-3xl p-8 max-w-5xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">How Our System Works for You</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-orange-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">1. Continuous Monitoring</h4>
                  <p className="text-gray-400 text-sm">AI cameras watch all areas 24/7, counting people in real-time</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-orange-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">2. Smart Analysis</h4>
                  <p className="text-gray-400 text-sm">System analyzes crowd density and predicts potential issues</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-orange-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">3. Instant Alerts</h4>
                  <p className="text-gray-400 text-sm">Get notified immediately when areas reach capacity limits</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-orange-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">4. Coordinated Response</h4>
                  <p className="text-gray-400 text-sm">Volunteers are automatically deployed to manage the situation</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Real-Time Counting</h3>
              <p className="text-gray-400 text-sm">Accurate people counting with 95%+ precision using AI</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Smartphone className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Mobile Access</h3>
              <p className="text-gray-400 text-sm">Monitor and respond from anywhere using mobile devices</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Predictive Alerts</h3>
              <p className="text-gray-400 text-sm">Get warnings before capacity is reached, not after</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Safety First</h3>
              <p className="text-gray-400 text-sm">Proactive measures prevent accidents and ensure smooth flow</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
