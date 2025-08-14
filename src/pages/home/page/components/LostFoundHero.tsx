import { Bell, Camera, MapPin, Search, Shield, Users } from 'lucide-react';

import { motion } from 'framer-motion';

const LostFoundHero = () => {
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
              AI-Powered
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                {" "}Lost & Found
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Advanced person tracking system using AI, CCTV integration, and volunteer coordination for safe pilgrimage experiences
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Search className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Smart Reporting</h3>
              <p className="text-gray-400 text-sm">Easy lost person registration with photo, Aadhar verification</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Camera className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">AI CCTV Search</h3>
              <p className="text-gray-400 text-sm">Real-time person detection across all camera feeds</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Volunteer Network</h3>
              <p className="text-gray-400 text-sm">Immediate response from nearby volunteers</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Bell className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Instant Notifications</h3>
              <p className="text-gray-400 text-sm">Real-time updates to family members</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <MapPin className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Location Tracking</h3>
              <p className="text-gray-400 text-sm">Precise camera location identification</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Safe Reunion</h3>
              <p className="text-gray-400 text-sm">Secure handover at designated centers</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LostFoundHero;
