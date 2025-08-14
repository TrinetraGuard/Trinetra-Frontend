import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import React, { useEffect, useState } from "react";

import { useLocation } from "react-router-dom";

interface NavLink {
  name: string;
  href: string;
}

const navLinks: NavLink[] = [
  { name: "Home", href: "/" },
  { name: "Crowd Control", href: "/crowd" },
  { name: "Lost & Found", href: "/lost-found" },
  { name: "Emergency", href: "/emergency" },
  { name: "Users", href: "/users" },
];

// Custom hook for scroll direction
const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar at the top of the page
      if (currentScrollY < 100) {
        setIsVisible(true);
        setScrollDirection('up');
        setPrevScrollY(currentScrollY);
        return;
      }

      // Determine scroll direction
      if (currentScrollY > prevScrollY) {
        setScrollDirection('down');
        setIsVisible(false);
      } else {
        setScrollDirection('up');
        setIsVisible(true);
      }
      
      setPrevScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollY]);

  return { isVisible, scrollDirection };
};

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { isVisible } = useScrollDirection();

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50">
      <motion.nav 
        initial={{ y: 0 }}
        animate={{ 
          y: isVisible ? 0 : -100,
          opacity: isVisible ? 1 : 0
        }}
        transition={{ 
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
        <div className="bg-white/10 backdrop-blur-xl shadow-lg rounded-full px-6 py-3 flex items-center justify-between border border-white/20 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl hover:bg-white/15">
          {/* Logo */}
          <a href="/" className="flex items-center font-bold text-xl">
            <img src="/assets/translogo.png" alt="Trinetra" className="w-18 h-10" />
            <span className="bg-gradient-to-r from-[#3acfec] to-[#0a72c5] bg-clip-text text-transparent">
              Trinetra
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={`font-medium transition-all duration-300 hover:transform hover:-translate-y-0.5 ${
                    isActive
                      ? "text-orange-600 font-semibold border-b-2 border-orange-600 pb-1"
                      : "text-white/80 hover:text-orange-300"
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden text-white/80 hover:text-white"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-16 left-0 w-full px-4 md:hidden"
            >
              <div className="bg-black/50 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 py-4">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.href;
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block px-6 py-3 transition-all duration-300 hover:transform hover:-translate-y-0.5 ${
                        isActive
                          ? "text-orange-400 font-semibold bg-white/10 border-l-4 border-orange-400"
                          : "text-white/90 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {link.name}
                    </a>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};

export default Navbar;
