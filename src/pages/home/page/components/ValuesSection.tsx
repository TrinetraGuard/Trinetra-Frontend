import { Award, Heart, Shield, Target, Users, Zap } from 'lucide-react';

import { motion } from 'framer-motion';

const ValuesSection = () => {
  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description: "We serve with empathy, understanding the spiritual significance of every pilgrimage and the importance of preserving sacred traditions.",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Security",
      description: "Protecting millions of lives through advanced technology while maintaining the sanctity of religious spaces.",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Continuously pushing boundaries to create cutting-edge solutions that revolutionize pilgrimage management.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Target,
      title: "Excellence",
      description: "Striving for perfection in every aspect of our service delivery and technology implementation.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Working together with authorities, volunteers, and communities to create safer pilgrimage experiences.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Award,
      title: "Trust",
      description: "Building lasting relationships through reliability, transparency, and consistent delivery of results.",
      color: "from-indigo-500 to-purple-500"
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
            Our
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              {" "}Values
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The principles that guide our mission and shape our approach to revolutionizing pilgrimage security
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-orange-500/30 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-4">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed">{value.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Commitment Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-3xl p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-6">Our Commitment</h3>
              <p className="text-gray-300 leading-relaxed max-w-4xl mx-auto text-lg">
                We are committed to serving the spiritual community with the highest standards of excellence, 
                innovation, and compassion. Our technology is designed to enhance rather than disrupt the 
                sacred experience, ensuring that every devotee can focus on their spiritual journey while 
                we handle their safety and security.
              </p>
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-orange-400" />
                  </div>
                  <span className="text-white font-semibold">Protecting Sacred Journeys</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ValuesSection;
