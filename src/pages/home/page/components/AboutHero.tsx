import { Award, Shield, Target, Users } from 'lucide-react';

import { motion } from 'framer-motion';

const AboutHero = () => {
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
              About
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                {" "}TrinetraGuard
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Revolutionizing pilgrimage security through cutting-edge AI technology, ensuring safe and seamless experiences for millions of devotees
            </p>
          </motion.div>

          {/* Company Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-white font-bold text-3xl mb-2">5+</p>
              <p className="text-gray-400 text-sm">Years Experience</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-white font-bold text-3xl mb-2">1M+</p>
              <p className="text-gray-400 text-sm">Lives Protected</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-white font-bold text-3xl mb-2">50+</p>
              <p className="text-gray-400 text-sm">Pilgrimage Sites</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-white font-bold text-3xl mb-2">99.9%</p>
              <p className="text-gray-400 text-sm">Success Rate</p>
            </div>
          </motion.div>

          {/* Company Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Our Story</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  Founded in 2019, TrinetraGuard emerged from a deep understanding of the challenges faced during major pilgrimage events. 
                  Our team of passionate technologists and security experts came together with a shared vision: to create a comprehensive 
                  security solution that would ensure the safety of millions of devotees while maintaining the sanctity of these sacred spaces.
                </p>
                <p>
                  What started as a small startup has now grown into a trusted partner for pilgrimage management across India. 
                  Our AI-powered solutions have been deployed at major religious sites, helping authorities manage crowds, 
                  locate missing persons, and respond to emergencies with unprecedented speed and accuracy.
                </p>
                <p>
                  Today, TrinetraGuard stands as a testament to innovation meeting tradition, where cutting-edge technology 
                  serves the spiritual needs of millions, ensuring that every devotee can experience their pilgrimage safely and peacefully.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
