import {
    FaBook,
    FaCode,
    FaCog,
    FaDesktop,
    FaFileAlt,
    FaFilePdf,
    FaGithub,
    FaGraduationCap,
    FaInfoCircle,
    FaMobile,
    FaPlay,
    FaProjectDiagram,
    FaRocket,
    FaServer,
    FaShieldAlt,
    FaStar,
    FaUsers
} from "react-icons/fa";
import {
    MdOutlineApi,
    MdOutlineSecurity,
    MdOutlineSpeed,
    MdOutlineSupport
} from "react-icons/md";

import DocumentationSection from "./documentation/DocumentationSection";
import GitHubRepos from "./documentation/GitHubRepos";
import ResearchPapers from "./documentation/ResearchPapers";
import Synopsis from "./documentation/Synopsis";
// Import sub-components
import { useState } from "react";

const Documentation = () => {
  const [activeTab, setActiveTab] = useState("synopsis");


  const documentationSections = [
    {
      id: "synopsis",
      title: "Project Synopsis",
      icon: <FaProjectDiagram className="w-5 h-5" />,
      description: "Overview of TrinetraGuard project",
      color: "from-blue-500 to-cyan-500",
      category: "Project"
    },
    {
      id: "documentation",
      title: "Documentation",
      icon: <FaFilePdf className="w-5 h-5" />,
      description: "Complete project documentation PDFs",
      color: "from-purple-500 to-pink-500",
      category: "Project"
    },
    {
      id: "research-papers",
      title: "Research Papers",
      icon: <FaGraduationCap className="w-5 h-5" />,
      description: "Academic research and technical papers",
      color: "from-green-500 to-emerald-500",
      category: "Project"
    },
    {
      id: "github-repos",
      title: "GitHub Repositories",
      icon: <FaGithub className="w-5 h-5" />,
      description: "Source code and project repositories",
      color: "from-gray-500 to-gray-700",
      category: "Project"
    },
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <FaRocket className="w-5 h-5" />,
      description: "Quick setup and installation guide",
      color: "from-orange-500 to-red-500",
      category: "Development"
    },
    {
      id: "api-reference",
      title: "API Reference",
      icon: <MdOutlineApi className="w-5 h-5" />,
      description: "Complete API documentation and endpoints",
      color: "from-indigo-500 to-purple-500",
      category: "Development"
    },
    {
      id: "deployment",
      title: "Deployment",
      icon: <FaServer className="w-5 h-5" />,
      description: "Deployment guides and configuration",
      color: "from-teal-500 to-cyan-500",
      category: "Development"
    },
    {
      id: "security",
      title: "Security",
      icon: <MdOutlineSecurity className="w-5 h-5" />,
      description: "Security best practices and guidelines",
      color: "from-red-500 to-pink-500",
      category: "Development"
    },
    {
      id: "tutorials",
      title: "Tutorials",
      icon: <FaPlay className="w-5 h-5" />,
      description: "Step-by-step tutorials and examples",
      color: "from-yellow-500 to-orange-500",
      category: "Development"
    },
    {
      id: "support",
      title: "Support",
      icon: <MdOutlineSupport className="w-5 h-5" />,
      description: "Help and support resources",
      color: "from-blue-500 to-indigo-500",
      category: "Development"
    }
  ];

  const quickLinks = [
    { id: "synopsis", title: "Project Overview", icon: <FaInfoCircle />, href: "#synopsis", color: "from-blue-500 to-cyan-500" },
    { id: "documentation", title: "Documentation PDFs", icon: <FaFilePdf />, href: "#documentation", color: "from-purple-500 to-pink-500" },
    { id: "research-papers", title: "Research Papers", icon: <FaGraduationCap />, href: "#research", color: "from-green-500 to-emerald-500" },
    { id: "github-repos", title: "GitHub Repos", icon: <FaGithub />, href: "#github", color: "from-gray-500 to-gray-700" },
    { id: "getting-started", title: "Quick Start", icon: <FaRocket />, href: "#getting-started", color: "from-orange-500 to-red-500" },
    { id: "api-reference", title: "API Docs", icon: <FaCode />, href: "#api", color: "from-indigo-500 to-purple-500" }
  ];

  const projectSections = documentationSections.filter(section => section.category === "Project");
  const developmentSections = documentationSections.filter(section => section.category === "Development");

  const renderContent = () => {
    switch (activeTab) {
      case "synopsis":
        return <Synopsis />;
      case "documentation":
        return <DocumentationSection />;
      case "research-papers":
        return <ResearchPapers />;
      case "github-repos":
        return <GitHubRepos />;
      case "getting-started":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaRocket className="text-orange-400" />
                Quick Start Guide
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">1. Prerequisites</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Node.js (v16 or higher)</li>
                    <li>• npm or yarn package manager</li>
                    <li>• Git for version control</li>
                    <li>• Firebase account (for backend services)</li>
                  </ul>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">2. Clone Repository</h4>
                  <code className="bg-gray-900 text-green-400 px-3 py-2 rounded text-sm block">
                    git clone https://github.com/trinetra-guard/trinetra-frontend.git
                  </code>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">3. Install Dependencies</h4>
                  <code className="bg-gray-900 text-green-400 px-3 py-2 rounded text-sm block">
                    cd trinetra-frontend && npm install
                  </code>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">4. Environment Setup</h4>
                  <code className="bg-gray-900 text-green-400 px-3 py-2 rounded text-sm block">
                    cp .env.example .env
                  </code>
                  <p className="text-gray-300 text-sm mt-2">Configure your environment variables in the .env file</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">5. Start Development Server</h4>
                  <code className="bg-gray-900 text-green-400 px-3 py-2 rounded text-sm block">
                    npm run dev
                  </code>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "api-reference":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MdOutlineApi className="text-indigo-400" />
                  Authentication
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <span className="text-indigo-400 font-mono text-sm">POST /api/auth/login</span>
                    <p className="text-gray-300 text-sm mt-1">Authenticate user credentials</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <span className="text-indigo-400 font-mono text-sm">GET /api/auth/verify</span>
                    <p className="text-gray-300 text-sm mt-1">Verify authentication token</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <span className="text-indigo-400 font-mono text-sm">POST /api/auth/logout</span>
                    <p className="text-gray-300 text-sm mt-1">Logout user session</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaUsers className="text-indigo-400" />
                  User Management
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <span className="text-indigo-400 font-mono text-sm">GET /api/users</span>
                    <p className="text-gray-300 text-sm mt-1">Retrieve user list</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <span className="text-indigo-400 font-mono text-sm">POST /api/users</span>
                    <p className="text-gray-300 text-sm mt-1">Create new user</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <span className="text-indigo-400 font-mono text-sm">PUT /api/users/:id</span>
                    <p className="text-gray-300 text-sm mt-1">Update user information</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "deployment":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaServer className="text-teal-400" />
                Deployment Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <FaDesktop className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                  <h4 className="text-white font-semibold">Web Application</h4>
                  <p className="text-gray-300 text-sm">Deploy to web servers</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <FaMobile className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                  <h4 className="text-white font-semibold">Mobile App</h4>
                  <p className="text-gray-300 text-sm">iOS and Android deployment</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <FaCog className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                  <h4 className="text-white font-semibold">Cloud Services</h4>
                  <p className="text-gray-300 text-sm">AWS, Azure, GCP support</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MdOutlineSecurity className="text-red-400" />
                Security Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FaShieldAlt className="text-red-400" />
                    <div>
                      <h4 className="text-white font-semibold">Authentication</h4>
                      <p className="text-gray-300 text-sm">Multi-factor authentication support</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MdOutlineSpeed className="text-red-400" />
                    <div>
                      <h4 className="text-white font-semibold">Rate Limiting</h4>
                      <p className="text-gray-300 text-sm">Protection against abuse</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FaStar className="text-red-400" />
                    <div>
                      <h4 className="text-white font-semibold">Data Encryption</h4>
                      <p className="text-gray-300 text-sm">End-to-end encryption</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaUsers className="text-red-400" />
                    <div>
                      <h4 className="text-white font-semibold">Role-Based Access</h4>
                      <p className="text-gray-300 text-sm">Granular permissions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "tutorials":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaPlay className="text-yellow-400" />
                  Beginner Tutorials
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-colors cursor-pointer">
                    <h4 className="text-white font-semibold">Setting Up Your First Project</h4>
                    <p className="text-gray-300 text-sm">Learn the basics of project setup</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-colors cursor-pointer">
                    <h4 className="text-white font-semibold">User Authentication</h4>
                    <p className="text-gray-300 text-sm">Implement secure user login</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaCode className="text-yellow-400" />
                  Advanced Tutorials
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-colors cursor-pointer">
                    <h4 className="text-white font-semibold">API Integration</h4>
                    <p className="text-gray-300 text-sm">Advanced API usage patterns</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-colors cursor-pointer">
                    <h4 className="text-white font-semibold">Custom Components</h4>
                    <p className="text-gray-300 text-sm">Building reusable components</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "support":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MdOutlineSupport className="text-blue-400" />
                Support Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FaBook className="text-blue-400" />
                    <div>
                      <h4 className="text-white font-semibold">Documentation</h4>
                      <p className="text-gray-300 text-sm">Comprehensive guides and references</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaUsers className="text-blue-400" />
                    <div>
                      <h4 className="text-white font-semibold">Community Forum</h4>
                      <p className="text-gray-300 text-sm">Connect with other developers</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FaGithub className="text-blue-400" />
                    <div>
                      <h4 className="text-white font-semibold">GitHub Issues</h4>
                      <p className="text-gray-300 text-sm">Report bugs and request features</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaFileAlt className="text-blue-400" />
                    <div>
                      <h4 className="text-white font-semibold">FAQ</h4>
                      <p className="text-gray-300 text-sm">Frequently asked questions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,48,0.1),transparent_50%)]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-6 py-2 rounded-full border border-blue-500/30 mb-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-blue-400 text-sm font-medium">Documentation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Complete <span className="bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent">Documentation</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about TrinetraGuard. From project overview to technical implementation.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-4 py-2 rounded-full border border-blue-500/30 mb-3">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-400 text-xs font-medium">Quick Access</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Documentation Sections</h3>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto">Navigate directly to the documentation section you need. Each section provides comprehensive information for different aspects of the project.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(link.id)}
                className={`relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border rounded-xl p-4 text-center transition-all duration-300 group shadow-lg hover:shadow-xl overflow-hidden ${
                  activeTab === link.id 
                    ? 'border-blue-500/50 from-blue-500/20 to-cyan-500/20' 
                    : 'border-gray-600/50 hover:from-gray-700/60 hover:to-gray-800/60 hover:border-blue-500/50'
                }`}
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Icon */}
                <div className={`transition-colors mb-3 text-xl relative z-10 ${
                  activeTab === link.id ? 'text-blue-300' : 'text-blue-400 group-hover:text-blue-300'
                }`}>
                  {link.icon}
                </div>
                
                {/* Title */}
                <span className={`text-sm font-medium block relative z-10 ${
                  activeTab === link.id ? 'text-white' : 'text-white'
                }`}>
                  {link.title}
                </span>
                
                {/* Active indicator */}
                {activeTab === link.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                )}
                
                {/* Hover indicator */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 transition-all duration-300 ${
                  activeTab !== link.id ? 'group-hover:from-blue-500/50 group-hover:to-cyan-500/50' : ''
                }`}></div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Project Documentation */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-6 sticky top-8">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <FaProjectDiagram className="text-blue-400" />
                Project Documentation
              </h3>
              <nav className="space-y-2">
                {projectSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                      activeTab === section.id
                        ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    {section.icon}
                    <div>
                      <div className="font-medium text-sm">{section.title}</div>
                      <div className="text-xs opacity-75">{section.description}</div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-6 min-h-[600px]">
              {renderContent()}
            </div>
          </div>

          {/* Right Sidebar - Development Documentation */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-6 sticky top-8">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <FaCode className="text-green-400" />
                Development Guide
              </h3>
              <nav className="space-y-2">
                {developmentSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                      activeTab === section.id
                        ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    {section.icon}
                    <div>
                      <div className="font-medium text-sm">{section.title}</div>
                      <div className="text-xs opacity-75">{section.description}</div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Documentation;