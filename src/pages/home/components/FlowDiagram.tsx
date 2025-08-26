import { FaBell, FaBroadcastTower, FaCamera, FaMobileAlt, FaSms, FaTools, FaTv, FaUserShield } from "react-icons/fa";
import { MdOutlineManageSearch, MdOutlineVolunteerActivism } from "react-icons/md";
import { SiBlockchaindotcom, SiGoogleanalytics, SiGoogletranslate } from "react-icons/si";

const FlowDiagram = () => {
  const leftBoxes = [
    {
      title: "Pilgrim App",
      description: "Mobile application for pilgrims",
      icons: [<FaMobileAlt key="mobile" />, <SiGoogletranslate key="translate" />, <MdOutlineManageSearch key="search" />],
      color: "cyan"
    },
    {
      title: "Authority App",
      description: "Management tools for authorities",
      icons: [<FaBroadcastTower key="broadcast" />, <FaBell key="bell" />, <MdOutlineVolunteerActivism key="volunteer" />],
      color: "blue"
    },
    {
      title: "Admin Panel",
      description: "Centralized control system",
      icons: [<SiBlockchaindotcom key="blockchain" />, <FaUserShield key="shield" />, <SiGoogleanalytics key="analytics" />],
      color: "purple"
    },
  ];

  const rightBoxes = [
    { 
      title: "LED Display Panels", 
      description: "Real-time information display",
      icons: [<FaTv key="tv" />],
      color: "orange"
    },
    { 
      title: "Emergency Services", 
      description: "Quick response systems",
      icons: [<FaTools key="tools" />],
      color: "red"
    },
    { 
      title: "Data Analytics Dashboard", 
      description: "Comprehensive insights",
      icons: [<SiGoogleanalytics key="analytics" />],
      color: "green"
    },
    { 
      title: "SMS/Notification Systems", 
      description: "Communication channels",
      icons: [<FaSms key="sms" />],
      color: "pink"
    },
    { 
      title: "CCTV Cameras", 
      description: "Surveillance & monitoring",
      icons: [<FaCamera key="camera" />],
      color: "yellow"
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; hover: string; shadow: string } } = {
      cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", hover: "hover:shadow-cyan-500/30", shadow: "shadow-cyan-500/20" },
      blue: { bg: "bg-blue-500/10", text: "text-blue-400", hover: "hover:shadow-blue-500/30", shadow: "shadow-blue-500/20" },
      purple: { bg: "bg-purple-500/10", text: "text-purple-400", hover: "hover:shadow-purple-500/30", shadow: "shadow-purple-500/20" },
      orange: { bg: "bg-orange-500/10", text: "text-orange-400", hover: "hover:shadow-orange-500/30", shadow: "shadow-orange-500/20" },
      red: { bg: "bg-red-500/10", text: "text-red-400", hover: "hover:shadow-red-500/30", shadow: "shadow-red-500/20" },
      green: { bg: "bg-green-500/10", text: "text-green-400", hover: "hover:shadow-green-500/30", shadow: "shadow-green-500/20" },
      indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400", hover: "hover:shadow-indigo-500/30", shadow: "shadow-indigo-500/20" },
      pink: { bg: "bg-pink-500/10", text: "text-pink-400", hover: "hover:shadow-pink-500/30", shadow: "shadow-pink-500/20" },
      yellow: { bg: "bg-yellow-500/10", text: "text-yellow-400", hover: "hover:shadow-yellow-500/30", shadow: "shadow-yellow-500/20" },
    };
    return colorMap[color] || colorMap.cyan;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,48,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_50%)]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Modern Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 px-4 sm:px-6 py-2 rounded-full border border-orange-500/30 mb-4">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <span className="text-orange-400 text-sm font-medium">Digital Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 px-4">
            Making Pilgrimage Management <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Seamless</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            Our comprehensive digital ecosystem integrates cutting-edge technology to create a seamless, secure, and efficient pilgrimage experience.
          </p>
        </div>

        {/* Mobile Layout */}
        <div className="block lg:hidden">
          {/* Mobile: Stacked Layout */}
          <div className="space-y-8">
            {/* Digital Applications Section */}
            <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-800/80 border border-gray-600/50 rounded-2xl p-6 backdrop-blur-sm shadow-2xl shadow-gray-900/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-bold text-white">Digital Applications</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {leftBoxes.map((box, idx) => {
                  const colors = getColorClasses(box.color);
                  return (
                    <div
                      key={idx}
                      className={`${colors.bg} border border-gray-600/50 p-4 rounded-lg flex flex-col items-center gap-3 hover:scale-105 transition-all duration-300 shadow-lg ${colors.hover} backdrop-blur-sm group`}
                    >
                      <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
                        {box.icons[0]}
                      </div>
                      <h3 className="font-semibold text-sm text-white text-center">{box.title}</h3>
                      <p className="text-gray-400 text-xs text-center leading-relaxed">{box.description}</p>
                      <div className={`flex gap-2 text-sm ${colors.text}`}>
                        {box.icons.slice(1).map((icon, i) => (
                          <span key={i} className="hover:scale-110 transition-transform duration-200 opacity-80 hover:opacity-100">{icon}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Center Core System */}
            <div className="bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-emerald-600/20 border border-emerald-500/40 p-6 rounded-2xl text-center hover:scale-105 transition-all duration-300 shadow-xl shadow-emerald-500/20 backdrop-blur-sm">
              <div className="w-12 h-12 mx-auto bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold mb-4 text-emerald-400">Digital Kumbh Core</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-600/50 hover:bg-gray-700/60 transition-all duration-200 hover:scale-105">
                  <span className="text-white text-xs font-medium">Crowd Mgmt.</span>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-600/50 hover:bg-gray-700/60 transition-all duration-200 hover:scale-105">
                  <span className="text-white text-xs font-medium">Lost & Found</span>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-600/50 hover:bg-gray-700/60 transition-all duration-200 hover:scale-105">
                  <span className="text-white text-xs font-medium">Volunteer System</span>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-600/50 hover:bg-gray-700/60 transition-all duration-200 hover:scale-105">
                  <span className="text-white text-xs font-medium">Predictive Alerts</span>
                </div>
              </div>
            </div>

            {/* Smart Infrastructure Section */}
            <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-800/80 border border-gray-600/50 rounded-2xl p-6 backdrop-blur-sm shadow-2xl shadow-gray-900/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-bold text-white">Smart Infrastructure</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-orange-500/50 to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rightBoxes.map((box, idx) => {
                  const colors = getColorClasses(box.color);
                  return (
                    <div
                      key={idx}
                      className={`${colors.bg} border border-gray-600/50 p-4 rounded-lg flex flex-col items-center gap-3 hover:scale-105 transition-all duration-300 shadow-lg ${colors.hover} backdrop-blur-sm group`}
                    >
                      <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
                        {box.icons[0]}
                      </div>
                      <h3 className="font-semibold text-sm text-white text-center">{box.title}</h3>
                      <p className="text-gray-400 text-xs text-center leading-relaxed">{box.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          {/* Desktop: Original Layout with Connection Lines */}
          <div className="relative min-h-[60vh] flex items-center justify-center">
            {/* Enhanced Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="leftToCenter" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="centerToRight" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#f97316" stopOpacity="1" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" opacity="0.8"/>
                </marker>
              </defs>
              
              {/* Left to Center Connections */}
              <line x1="28%" y1="35%" x2="42%" y2="50%" stroke="url(#leftToCenter)" strokeWidth="3" filter="url(#glow)" opacity="0.9" markerEnd="url(#arrowhead)"/>
              <line x1="28%" y1="50%" x2="42%" y2="50%" stroke="url(#leftToCenter)" strokeWidth="3" filter="url(#glow)" opacity="0.9" markerEnd="url(#arrowhead)"/>
              <line x1="28%" y1="65%" x2="42%" y2="50%" stroke="url(#leftToCenter)" strokeWidth="3" filter="url(#glow)" opacity="0.9" markerEnd="url(#arrowhead)"/>
              
              {/* Center to Right Connections */}
              <line x1="58%" y1="50%" x2="72%" y2="20%" stroke="url(#centerToRight)" strokeWidth="3" filter="url(#glow)" opacity="0.9" markerEnd="url(#arrowhead)"/>
              <line x1="58%" y1="50%" x2="72%" y2="40%" stroke="url(#centerToRight)" strokeWidth="3" filter="url(#glow)" opacity="0.9" markerEnd="url(#arrowhead)"/>
              <line x1="58%" y1="50%" x2="72%" y2="60%" stroke="url(#centerToRight)" strokeWidth="3" filter="url(#glow)" opacity="0.9" markerEnd="url(#arrowhead)"/>
              <line x1="58%" y1="50%" x2="72%" y2="80%" stroke="url(#centerToRight)" strokeWidth="3" filter="url(#glow)" opacity="0.9" markerEnd="url(#arrowhead)"/>
              <line x1="58%" y1="50%" x2="72%" y2="100%" stroke="url(#centerToRight)" strokeWidth="3" filter="url(#glow)" opacity="0.9" markerEnd="url(#arrowhead)"/>
            </svg>

            {/* Left Side - Apps with Modern Section Box */}
            <div className="absolute left-8">
              <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-800/80 border border-gray-600/50 rounded-2xl p-6 backdrop-blur-sm shadow-2xl shadow-gray-900/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-bold text-white">Digital Applications</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {leftBoxes.map((box, idx) => {
                    const colors = getColorClasses(box.color);
                    return (
                      <div
                        key={idx}
                        className={`${colors.bg} border border-gray-600/50 p-3 rounded-lg flex flex-col items-center gap-2 w-32 hover:scale-105 transition-all duration-300 shadow-lg ${colors.hover} backdrop-blur-sm group`}
                      >
                        <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
                          {box.icons[0]}
                        </div>
                        <h3 className="font-semibold text-xs text-white text-center leading-tight">{box.title}</h3>
                        <p className="text-gray-400 text-xs text-center leading-tight">{box.description}</p>
                        <div className={`flex gap-1 text-sm ${colors.text}`}>
                          {box.icons.slice(1).map((icon, i) => (
                            <span key={i} className="hover:scale-110 transition-transform duration-200 opacity-80 hover:opacity-100">{icon}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Center - Core System */}
            <div className="bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-emerald-600/20 border border-emerald-500/40 p-6 rounded-2xl w-60 text-center hover:scale-105 transition-all duration-300 shadow-xl shadow-emerald-500/20 backdrop-blur-sm">
              <div className="w-12 h-12 mx-auto bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold mb-4 text-emerald-400">Digital Kumbh Core</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-600/50 hover:bg-gray-700/60 transition-all duration-200 hover:scale-105">
                  <span className="text-white text-xs font-medium">Crowd Mgmt.</span>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-600/50 hover:bg-gray-700/60 transition-all duration-200 hover:scale-105">
                  <span className="text-white text-xs font-medium">Lost & Found</span>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-600/50 hover:bg-gray-700/60 transition-all duration-200 hover:scale-105">
                  <span className="text-white text-xs font-medium">Volunteer System</span>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-600/50 hover:bg-gray-700/60 transition-all duration-200 hover:scale-105">
                  <span className="text-white text-xs font-medium">Predictive Alerts</span>
                </div>
              </div>
            </div>

            {/* Right Side - Services */}
            <div className="absolute right-8">
              <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-800/80 border border-gray-600/50 rounded-2xl p-6 backdrop-blur-sm shadow-2xl shadow-gray-900/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-bold text-white">Smart Infrastructure</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-orange-500/50 to-transparent"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {rightBoxes.map((box, idx) => {
                    const colors = getColorClasses(box.color);
                    return (
                      <div
                        key={idx}
                        className={`${colors.bg} border border-gray-600/50 p-3 rounded-lg flex flex-col items-center gap-2 w-32 hover:scale-105 transition-all duration-300 shadow-lg ${colors.hover} backdrop-blur-sm group`}
                      >
                        <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
                          {box.icons[0]}
                        </div>
                        <h3 className="font-semibold text-xs text-white text-center leading-tight">{box.title}</h3>
                        <p className="text-gray-400 text-xs text-center leading-tight">{box.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlowDiagram;