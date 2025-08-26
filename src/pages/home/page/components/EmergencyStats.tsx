import { AlertTriangle, Award, Clock, MapPin, Shield, TrendingUp, Users, Zap } from "lucide-react";

import { motion } from "framer-motion";

const EmergencyStats = () => {
  const stats = [
    {
      icon: Clock,
      value: "1.2",
      unit: "min",
      label: "Average Response Time",
      description: "From detection to first responder arrival",
      color: "from-red-500 to-orange-500"
    },
    {
      icon: Users,
      value: "500+",
      unit: "",
      label: "Active Volunteers",
      description: "Trained emergency responders on duty",
      color: "from-orange-500 to-yellow-500"
    },
    {
      icon: Shield,
      value: "99.8",
      unit: "%",
      label: "Success Rate",
      description: "Emergency resolution success rate",
      color: "from-yellow-500 to-green-500"
    },
    {
      icon: MapPin,
      value: "100",
      unit: "%",
      label: "Coverage Area",
      description: "Complete pilgrimage site coverage",
      color: "from-green-500 to-blue-500"
    },
    {
      icon: Zap,
      value: "24/7",
      unit: "",
      label: "Monitoring",
      description: "Round-the-clock emergency monitoring",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: TrendingUp,
      value: "50+",
      unit: "k",
      label: "Lives Saved",
      description: "Emergency situations successfully resolved",
      color: "from-purple-500 to-pink-500"
    }
  ];

  const achievements = [
    {
      icon: Award,
      title: "Best Emergency Response System",
      description: "Awarded by National Security Council",
      year: "2024"
    },
    {
      icon: Award,
      title: "Innovation in Public Safety",
      description: "Recognized by Ministry of Home Affairs",
      year: "2023"
    },
    {
      icon: Award,
      title: "AI Excellence Award",
      description: "For advanced emergency detection technology",
      year: "2023"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-800 via-gray-900 to-black relative overflow-hidden">
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
            Emergency Response
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"> Statistics</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Proven track record of excellence in emergency response with impressive statistics and achievements
          </p>
        </motion.div>

        {/* Statistics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-8 backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl md:text-4xl font-bold text-white">{stat.value}</span>
                <span className="text-xl font-semibold text-orange-400">{stat.unit}</span>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">{stat.label}</h3>
              <p className="text-gray-300 text-sm">{stat.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Awards & Recognition
            </h3>
            <p className="text-gray-300 text-lg">
              Our commitment to excellence has been recognized by leading authorities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <achievement.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">{achievement.title}</h4>
                <p className="text-gray-300 text-sm mb-4">{achievement.description}</p>
                <div className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold rounded-lg px-3 py-1">
                  {achievement.year}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-12 backdrop-blur-sm">
            <AlertTriangle className="w-16 h-16 text-orange-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Experience Advanced Emergency Response?
            </h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of pilgrims who trust our AI-powered emergency response system for their safety and security
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Get Started Today
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EmergencyStats;
