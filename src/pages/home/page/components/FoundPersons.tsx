import { CheckCircle, Clock, MapPin, Monitor, Phone, Users } from 'lucide-react';

import { motion } from 'framer-motion';

const FoundPersons = () => {
  const foundPersons = [
    {
      id: 1,
      name: "Lakshmi Devi",
      age: 58,
      foundAt: "Food Court Area",
      foundTime: "15 minutes ago",
      status: "At Help Center",
      contact: "+91 98765 43210",
      photo: "https://via.placeholder.com/80x80/4F46E5/FFFFFF?text=LD"
    },
    {
      id: 2,
      name: "Ramesh Kumar",
      age: 45,
      foundAt: "Parking Lot",
      foundTime: "1 hour ago",
      status: "Family Contacted",
      contact: "+91 98765 43211",
      photo: "https://via.placeholder.com/80x80/059669/FFFFFF?text=RK"
    },
    {
      id: 3,
      name: "Sunita Patel",
      age: 35,
      foundAt: "Temple Area",
      foundTime: "2 hours ago",
      status: "Reunited",
      contact: "+91 98765 43212",
      photo: "https://via.placeholder.com/80x80/DC2626/FFFFFF?text=SP"
    }
  ];

  const ledScreens = [
    {
      location: "Main Gate",
      status: "active",
      currentDisplay: "Lakshmi Devi - Found at Food Court"
    },
    {
      location: "Temple Area",
      status: "active",
      currentDisplay: "Ramesh Kumar - Found at Parking Lot"
    },
    {
      location: "Food Court",
      status: "standby",
      currentDisplay: "No active displays"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'At Help Center': return 'text-yellow-400';
      case 'Family Contacted': return 'text-blue-400';
      case 'Reunited': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'At Help Center': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'Family Contacted': return 'bg-blue-500/20 border-blue-500/30';
      case 'Reunited': return 'bg-green-500/20 border-green-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

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
            Found Persons
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              {" "}Management
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive system for managing found persons with LED screen displays and family reunification
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Found Persons List */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-400" />
                Recently Found Persons
              </h3>
              
              <div className="space-y-4">
                {foundPersons.map((person) => (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    viewport={{ once: true }}
                    className={`p-4 rounded-xl border ${getStatusBg(person.status)}`}
                  >
                    <div className="flex items-start gap-4">
                      <img 
                        src={person.photo} 
                        alt={person.name}
                        className="w-16 h-16 rounded-full border-2 border-white/20"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-semibold text-lg">{person.name}</h4>
                          <span className={`text-sm font-medium ${getStatusColor(person.status)}`}>
                            {person.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Age:</span>
                            <span className="text-white">{person.age} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Found at:</span>
                            <span className="text-white">{person.foundAt}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Time:</span>
                            <span className="text-white">{person.foundTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Contact:</span>
                            <span className="text-white">{person.contact}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <button className="flex items-center gap-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg px-3 py-2 text-orange-400 text-sm transition-all duration-300">
                        <Phone className="w-4 h-4" />
                        Call Contact
                      </button>
                      <button className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-3 py-2 text-green-400 text-sm transition-all duration-300">
                        <CheckCircle className="w-4 h-4" />
                        Mark Reunited
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* LED Screen Management */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-orange-400" />
                LED Screen Displays
              </h3>
              
              <div className="space-y-4">
                {ledScreens.map((screen, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-semibold">{screen.location}</h4>
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {screen.location} Area
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${
                          screen.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {screen.status}
                        </span>
                        <p className="text-gray-400 text-xs">LED Screen</p>
                      </div>
                    </div>
                    
                    <div className="bg-black/50 rounded-lg p-3 border border-gray-600">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-sm font-medium">LIVE DISPLAY</span>
                      </div>
                      <p className="text-white text-sm font-mono">{screen.currentDisplay}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      <button className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-3 py-2 text-blue-400 text-sm transition-all duration-300">
                        <Monitor className="w-4 h-4" />
                        Update Display
                      </button>
                      <button className="flex items-center gap-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded-lg px-3 py-2 text-gray-400 text-sm transition-all duration-300">
                        <Clock className="w-4 h-4" />
                        Schedule
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold text-xl mb-6">Found Persons Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-white font-bold text-2xl">3</p>
                  <p className="text-gray-400 text-sm">Found Today</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-white font-bold text-2xl">2</p>
                  <p className="text-gray-400 text-sm">Reunited</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Found Person Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-3xl p-8"
        >
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Found Person Process
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Person Found</h4>
              <p className="text-gray-400 text-sm">Volunteer identifies lost person in area</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Safe Escort</h4>
              <p className="text-gray-400 text-sm">Person escorted to nearest help center</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">LED Display</h4>
              <p className="text-gray-400 text-sm">Information displayed on area LED screens</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Family Contact</h4>
              <p className="text-gray-400 text-sm">Family notified and reunion coordinated</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FoundPersons;
