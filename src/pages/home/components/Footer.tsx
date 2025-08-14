import { FaEnvelope, FaGithub, FaLinkedin, FaMapMarkerAlt, FaPhone, FaTwitter } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "#" },
    { name: "About", href: "#" },
    { name: "Documentation", href: "#documentation" },
    { name: "FAQ", href: "#" },
    { name: "Contact", href: "#" },
  ];

  const services = [
    { name: "Crowd Management", href: "#" },
    { name: "Face Detection", href: "#" },
    { name: "Emergency Response", href: "#" },
    { name: "Data Analytics", href: "#" },
    { name: "Security Monitoring", href: "#" },
  ];

  const socialLinks = [
    { name: "GitHub", icon: "github", href: "https://github.com/TrinetraGuard" },
    { name: "LinkedIn", icon: "linkedin", href: "#" },
    { name: "Twitter", icon: "twitter", href: "#" },
  ];

  const getSocialIcon = (iconName: string) => {
    switch (iconName) {
      case "github":
        return <FaGithub className="w-5 h-5" />;
      case "linkedin":
        return <FaLinkedin className="w-5 h-5" />;
      case "twitter":
        return <FaTwitter className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,48,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <h3 className="text-2xl font-bold text-white">TrinetraGuard</h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Advanced AI-powered security solutions designed to ensure safe and efficient pilgrimage experiences through cutting-edge technology and transparent operations.
              </p>
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800/50 hover:bg-orange-500/20 border border-gray-600/50 hover:border-orange-500/50 rounded-xl flex items-center justify-center text-gray-400 hover:text-orange-400 transition-all duration-300"
                  >
                    {getSocialIcon(social.icon)}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-orange-400 transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <div className="w-1 h-1 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-6">Services</h4>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service.name}>
                    <a
                      href={service.href}
                      className="text-gray-300 hover:text-orange-400 transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <div className="w-1 h-1 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {service.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-6">Contact Info</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <FaMapMarkerAlt className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Maharashtra, India<br />
                      Pilgrimage Management Hub
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <FaEnvelope className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">
                      support@trinetraguard.com
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <FaPhone className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">
                      +91 (Emergency Support)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-700/50">
          <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-xl mb-2">
                    Stay Updated
                  </h4>
                  <p className="text-gray-300">
                    Subscribe to our newsletter for the latest updates on TrinetraGuard features and security insights.
                  </p>
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 lg:w-64 px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 text-white placeholder-gray-400"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50">
          <div className="container mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-gray-400 text-sm">
                © {currentYear} TrinetraGuard. All rights reserved. Making pilgrimage management seamless, transparent, and open.
              </div>
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
