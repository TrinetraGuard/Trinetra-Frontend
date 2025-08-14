import { Brain, Calendar, Clock, MapPin, Target, TrendingUp } from 'lucide-react';

import { motion } from 'framer-motion';

const DataAnalytics = () => {
  const historicalData = [
    { date: '2024-01-15', mainGate: 450, templeArea: 850, parkingLot: 280, foodCourt: 380 },
    { date: '2024-01-16', mainGate: 520, templeArea: 920, parkingLot: 320, foodCourt: 420 },
    { date: '2024-01-17', mainGate: 480, templeArea: 880, parkingLot: 290, foodCourt: 400 },
    { date: '2024-01-18', mainGate: 600, templeArea: 1050, parkingLot: 350, foodCourt: 450 },
    { date: '2024-01-19', mainGate: 550, templeArea: 980, parkingLot: 310, foodCourt: 430 },
    { date: '2024-01-20', mainGate: 580, templeArea: 1020, parkingLot: 340, foodCourt: 460 },
    { date: '2024-01-21', mainGate: 500, templeArea: 900, parkingLot: 300, foodCourt: 410 }
  ];

  const peakHours = [
    { hour: '06:00', count: 120 },
    { hour: '08:00', count: 450 },
    { hour: '10:00', count: 780 },
    { hour: '12:00', count: 920 },
    { hour: '14:00', count: 850 },
    { hour: '16:00', count: 680 },
    { hour: '18:00', count: 420 },
    { hour: '20:00', count: 180 }
  ];

  const areaStats = [
    {
      name: 'Main Gate',
      avgDaily: 520,
      peakHour: '12:00 PM',
      maxCapacity: 500,
      utilization: 85
    },
    {
      name: 'Temple Area',
      avgDaily: 950,
      peakHour: '11:00 AM',
      maxCapacity: 1000,
      utilization: 92
    },
    {
      name: 'Parking Lot',
      avgDaily: 310,
      peakHour: '10:00 AM',
      maxCapacity: 300,
      utilization: 78
    },
    {
      name: 'Food Court',
      avgDaily: 420,
      peakHour: '01:00 PM',
      maxCapacity: 400,
      utilization: 88
    }
  ];

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-400';
    if (utilization >= 75) return 'text-yellow-400';
    return 'text-green-400';
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
            Smart
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              {" "}Analytics & Insights
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Make data-driven decisions with comprehensive analytics and AI-powered predictions
          </p>
        </motion.div>

        {/* Analytics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
              <Brain className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold text-lg mb-2">AI Predictions</h3>
              <p className="text-gray-400 text-sm">Get 30-minute advance warnings of crowd surges</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
              <Target className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold text-lg mb-2">Optimization</h3>
              <p className="text-gray-400 text-sm">Optimize volunteer deployment and resource allocation</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
              <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold text-lg mb-2">Trend Analysis</h3>
              <p className="text-gray-400 text-sm">Understand patterns and improve planning</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Weekly Trends */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              Weekly Crowd Trends
            </h3>
            
            <div className="space-y-4">
              {historicalData.slice(-7).map((day, index) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      <span className="text-white font-medium">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">
                      Total: {day.mainGate + day.templeArea + day.parkingLot + day.foodCourt}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <p className="text-white font-semibold text-sm">{day.mainGate}</p>
                      <p className="text-gray-400 text-xs">Main Gate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold text-sm">{day.templeArea}</p>
                      <p className="text-gray-400 text-xs">Temple</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold text-sm">{day.parkingLot}</p>
                      <p className="text-gray-400 text-xs">Parking</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold text-sm">{day.foodCourt}</p>
                      <p className="text-gray-400 text-xs">Food</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Peak Hours Analysis */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              Peak Hours Analysis
            </h3>
            
            <div className="space-y-4">
              {peakHours.map((hour, index) => (
                <motion.div
                  key={hour.hour}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-white font-medium">{hour.hour}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(hour.count / 1000) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold text-sm min-w-[3rem]">{hour.count}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Area Statistics */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-white font-semibold text-xl mb-8 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-400" />
            Area Performance Statistics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {areaStats.map((area, index) => (
              <motion.div
                key={area.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 rounded-xl p-6 border border-white/10"
              >
                <h4 className="text-white font-semibold text-lg mb-4">{area.name}</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Avg Daily</span>
                    <span className="text-white font-semibold">{area.avgDaily}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Peak Hour</span>
                    <span className="text-white font-semibold">{area.peakHour}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Max Capacity</span>
                    <span className="text-white font-semibold">{area.maxCapacity}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Utilization</span>
                    <span className={`font-semibold ${getUtilizationColor(area.utilization)}`}>
                      {area.utilization}%
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      area.utilization >= 90 ? 'bg-red-500' :
                      area.utilization >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${area.utilization}%` }}
                  ></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Key Insights for Better Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-orange-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Peak Hours</h4>
                <p className="text-gray-400 text-sm">11:00 AM - 2:00 PM are the busiest hours requiring maximum volunteer deployment</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-orange-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Capacity Planning</h4>
                <p className="text-gray-400 text-sm">Temple Area consistently reaches 90%+ capacity, requiring proactive management</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-orange-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Predictive Analytics</h4>
                <p className="text-gray-400 text-sm">AI models predict crowd surges 30 minutes in advance for better preparation</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              How to Use This Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-white font-semibold text-lg mb-4">For Planning</h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Schedule more volunteers during peak hours (11 AM - 2 PM)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Prepare additional resources for Temple Area management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Set up temporary barriers before predicted crowd surges</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold text-lg mb-4">For Response</h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Deploy volunteers 30 minutes before predicted peaks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Focus resources on areas showing increasing trends</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use historical data to optimize volunteer placement</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DataAnalytics;
