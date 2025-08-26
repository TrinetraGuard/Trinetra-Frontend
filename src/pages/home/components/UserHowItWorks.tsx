import { motion } from "framer-motion";
import React from "react";

const UserHowItWorks: React.FC = () => {
  const steps = [
    {
      step: "01",
      title: "Download & Register",
      description: "Get our app and create your account with basic information"
    },
    {
      step: "02",
      title: "Plan Your Journey",
      description: "Set your timeline and preferences for personalized recommendations"
    },
    {
      step: "03",
      title: "Enjoy Safe Travel",
      description: "Access all features and stay connected throughout your journey"
    }
  ];

  return (
    <section className="py-20 bg-white/5 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How It <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Simple steps to get started with your enhanced pilgrimage experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center group"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold group-hover:scale-110 transition-transform duration-300 shadow-lg">
                {item.step}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-gray-300 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserHowItWorks;
