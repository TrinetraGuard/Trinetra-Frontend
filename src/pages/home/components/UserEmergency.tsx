import { AlertTriangle, CheckCircle } from "lucide-react";

import { motion } from "framer-motion";
import React from "react";

const UserEmergency: React.FC = () => {
  const emergencyFeatures = [
    "Instant emergency alert system",
    "GPS location sharing",
    "Direct connection to authorities",
    "Family notification system",
    "Multi-language support"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-red-900/20 via-orange-900/30 to-red-800/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Emergency Response at Your <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">Fingertips</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Our SOS system ensures immediate response in critical situations. With one tap, you can alert emergency services and notify your family members.
            </p>
            <div className="space-y-4">
              {emergencyFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-200 font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-red-500/20">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">SOS Emergency</h3>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Press the SOS button in case of any emergency. Our system will immediately connect you to the nearest emergency services and share your location.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
              >
                <AlertTriangle className="w-5 h-5" />
                Emergency SOS
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default UserEmergency;
