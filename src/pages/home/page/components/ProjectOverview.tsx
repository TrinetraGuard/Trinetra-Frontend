import { Brain, Camera, Monitor, Shield, Users, Zap } from 'lucide-react';

import { motion } from 'framer-motion';

const ProjectOverview = () => {
  const projects = [
    {
      id: 1,
      title: "AI-Powered Crowd Management",
      description: "Advanced computer vision system for real-time crowd monitoring and density analysis",
      features: ["Live people counting", "Capacity alerts", "Predictive analytics", "Volunteer coordination"],
      icon: Users,
      image: "https://via.placeholder.com/1024x1024/4F46E5/FFFFFF?text=Crowd+Management"
    },
    {
      id: 2,
      title: "Smart Lost & Found System",
      description: "AI-driven person tracking and family reunification system using CCTV integration",
      features: ["Face recognition", "Real-time search", "Volunteer alerts", "LED displays"],
      icon: Camera,
      image: "https://via.placeholder.com/1024x1024/059669/FFFFFF?text=Lost+Found"
    },
    {
      id: 3,
      title: "Emergency Response Platform",
      description: "Comprehensive emergency management system with instant alerting and coordination",
      features: ["Instant notifications", "Location tracking", "Response coordination", "Status monitoring"],
      icon: Shield,
      image: "https://via.placeholder.com/1024x1024/DC2626/FFFFFF?text=Emergency+Response"
    }
  ];

  const technologies = [
    {
      name: "Computer Vision",
      description: "Advanced AI algorithms for real-time image processing and analysis",
      icon: Brain
    },
    {
      name: "IoT Integration",
      description: "Seamless connectivity with cameras, sensors, and monitoring devices",
      icon: Monitor
    },
    {
      name: "Real-time Analytics",
      description: "Instant data processing and predictive insights for proactive management",
      icon: Zap
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
              {" "}Projects
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Innovative solutions designed to revolutionize pilgrimage security and management
          </p>
        </motion.div>

        {/* Project Showcase */}
        <div className="space-y-12 mb-16">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8`}
            >
              {/* Project Image */}
              <div className="flex-1">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center overflow-hidden">
                    <div className="text-center">
                      <project.icon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg font-medium">{project.title}</p>
                      <p className="text-gray-500 text-sm">1024x1024 pixels</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                      <project.icon className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="text-white font-semibold text-2xl">{project.title}</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{project.description}</p>
                </div>

                <div>
                  <h4 className="text-white font-semibold text-lg mb-3">Key Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {project.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg px-4 py-2 text-orange-400 text-sm transition-all duration-300">
                    Learn More
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-2 text-white text-sm transition-all duration-300">
                    View Demo
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Technology Stack</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {technologies.map((tech, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <tech.icon className="w-8 h-8 text-orange-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">{tech.name}</h4>
                  <p className="text-gray-400 text-sm">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Project Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Camera className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-white font-bold text-2xl mb-2">150+</p>
            <p className="text-gray-400 text-sm">Cameras Deployed</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-white font-bold text-2xl mb-2">1M+</p>
            <p className="text-gray-400 text-sm">Lives Protected</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-white font-bold text-2xl mb-2">50+</p>
            <p className="text-gray-400 text-sm">Sites Secured</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-white font-bold text-2xl mb-2">99.9%</p>
            <p className="text-gray-400 text-sm">Success Rate</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectOverview;
