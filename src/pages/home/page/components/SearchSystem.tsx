import { Brain, Camera, Clock, Eye, MapPin, Users } from 'lucide-react';

import { motion } from 'framer-motion';

const SearchSystem = () => {
  const searchFeatures = [
    {
      icon: Brain,
      title: "AI Face Recognition",
      description: "Advanced computer vision algorithms identify persons across all camera feeds",
      details: ["Real-time processing", "High accuracy detection", "Multiple angle analysis", "Age and gender recognition"]
    },
    {
      icon: Camera,
      title: "Live CCTV Integration",
      description: "Seamless connection to all surveillance cameras in the pilgrimage area",
      details: ["24/7 monitoring", "Multiple camera feeds", "HD quality streams", "Network redundancy"]
    },
    {
      icon: Eye,
      title: "Movement Tracking",
      description: "Track person movement patterns and predict possible locations",
      details: ["Path analysis", "Direction prediction", "Speed calculation", "Behavioral patterns"]
    },
    {
      icon: MapPin,
      title: "Location Mapping",
      description: "Precise location identification with GPS coordinates and area mapping",
      details: ["GPS integration", "Area mapping", "Distance calculation", "Route optimization"]
    }
  ];

  const searchStats = [
    { label: "Cameras Connected", value: "150+", icon: Camera },
    { label: "Search Accuracy", value: "99.2%", icon: Brain },
    { label: "Response Time", value: "< 30s", icon: Clock },
    { label: "Areas Covered", value: "25+", icon: MapPin }
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
            AI-Powered
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              {" "}Search System
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Advanced computer vision and AI algorithms working together to locate missing persons in real-time
          </p>
        </motion.div>

        {/* Search Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {searchFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-orange-500/30 transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-8 h-8 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-xl mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {feature.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">{detail}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {searchStats.map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-orange-400" />
              </div>
              <p className="text-white font-bold text-2xl mb-2">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Search Process Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-3xl p-8"
        >
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Search Process Flow
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">1. Camera Feed</h4>
              <p className="text-gray-400 text-sm">Live video streams from all connected cameras</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">2. AI Analysis</h4>
              <p className="text-gray-400 text-sm">Face recognition and person detection algorithms</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">3. Location Found</h4>
              <p className="text-gray-400 text-sm">Precise camera location and coordinates identified</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">4. Alert Sent</h4>
              <p className="text-gray-400 text-sm">Volunteers notified with location and person details</p>
            </div>
          </div>
        </motion.div>

        {/* Technical Specifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <h3 className="text-white font-semibold text-2xl mb-6 text-center">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="text-orange-400 font-semibold text-lg">AI Capabilities</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Real-time face recognition</li>
                  <li>• Multi-camera tracking</li>
                  <li>• Behavioral analysis</li>
                  <li>• Pattern recognition</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-orange-400 font-semibold text-lg">Camera Integration</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• HD video processing</li>
                  <li>• Low-light optimization</li>
                  <li>• Network redundancy</li>
                  <li>• Scalable architecture</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-orange-400 font-semibold text-lg">Response System</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Instant notifications</li>
                  <li>• Location mapping</li>
                  <li>• Volunteer coordination</li>
                  <li>• Status tracking</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SearchSystem;
