import { ArrowRight, MapPin, Navigation, Phone, Search, Shield } from "lucide-react";

import { motion } from "framer-motion";
import React from "react";

const UserHero: React.FC = () => {
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
              Your Complete
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                {" "}Pilgrimage Companion
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Experience safe, organized, and memorable pilgrimages with our comprehensive suite of features designed specifically for your spiritual journey
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
                <Navigation className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Smart Roadmap</h3>
              <p className="text-gray-400 text-sm">Personalized visit schedules and route optimization</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Search className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Lost & Found</h3>
              <p className="text-gray-400 text-sm">AI-powered face recognition for missing persons</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <MapPin className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Essential Services</h3>
              <p className="text-gray-400 text-sm">Find nearby medical, food, and accommodation</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Phone className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">24/7 Support</h3>
              <p className="text-gray-400 text-sm">Round-the-clock assistance and emergency hotlines</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Event Information</h3>
              <p className="text-gray-400 text-sm">Comprehensive details about events and places</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <ArrowRight className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">SOS Emergency</h3>
              <p className="text-gray-400 text-sm">One-tap emergency alert system</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default UserHero;
