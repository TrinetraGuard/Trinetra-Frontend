import { Eye, Heart, Shield, Target, Zap } from 'lucide-react';

import { motion } from 'framer-motion';

const MissionVision = () => {
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
            Our
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              {" "}Mission & Vision
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Driving innovation in pilgrimage security to create safer, more organized, and spiritually fulfilling experiences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-2xl">Our Mission</h3>
                <p className="text-gray-400">What drives us forward</p>
              </div>
            </div>
            <div className="text-gray-300 leading-relaxed space-y-4">
              <p>
                To revolutionize pilgrimage security through cutting-edge AI technology, ensuring that every devotee 
                can experience their spiritual journey safely and peacefully. We are committed to protecting millions 
                of lives while preserving the sanctity and tradition of sacred spaces.
              </p>
              <p>
                Our mission extends beyond technology - we strive to create a seamless bridge between innovation 
                and tradition, where advanced security solutions enhance rather than disrupt the spiritual experience.
              </p>
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                <Eye className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-2xl">Our Vision</h3>
                <p className="text-gray-400">Where we're heading</p>
              </div>
            </div>
            <div className="text-gray-300 leading-relaxed space-y-4">
              <p>
                To become the global standard for pilgrimage security, setting new benchmarks in crowd management, 
                emergency response, and visitor safety. We envision a world where technology serves spirituality, 
                making sacred journeys accessible and secure for everyone.
              </p>
              <p>
                We aspire to expand our reach to major religious sites worldwide, creating a network of smart, 
                connected, and secure pilgrimage destinations that serve as models for the future of religious tourism.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Our Core Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-orange-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Compassion</h4>
                <p className="text-gray-400 text-sm">We serve with empathy, understanding the spiritual significance of every pilgrimage</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-orange-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Innovation</h4>
                <p className="text-gray-400 text-sm">Continuously pushing boundaries to create better security solutions</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-orange-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Excellence</h4>
                <p className="text-gray-400 text-sm">Striving for perfection in every aspect of our service delivery</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-orange-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Trust</h4>
                <p className="text-gray-400 text-sm">Building lasting relationships through reliability and transparency</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MissionVision;
