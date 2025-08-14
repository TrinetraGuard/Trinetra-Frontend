import { Camera, CheckCircle, FileText, Shield, UserPlus } from 'lucide-react';

import { motion } from 'framer-motion';

const ReportProcess = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Report Lost Person",
      description: "User submits lost person details with photo, name, phone, and Aadhar number",
      details: ["Mobile app interface", "Photo upload", "Personal details", "Contact information"]
    },
    {
      icon: FileText,
      title: "Admin Verification",
      description: "Admin reviews and authenticates the submitted information",
      details: ["Document verification", "Photo validation", "Aadhar confirmation", "Request approval"]
    },
    {
      icon: Camera,
      title: "AI CCTV Search",
      description: "AI scans live camera feeds to locate the missing person",
      details: ["Real-time scanning", "Face recognition", "Location tracking", "Movement analysis"]
    },
    {
      icon: Shield,
      title: "Volunteer Alert",
      description: "Nearby volunteers receive location and person details",
      details: ["Instant notification", "Location sharing", "Person details", "Response coordination"]
    },
    {
      icon: CheckCircle,
      title: "Person Found",
      description: "Volunteer locates and safely escorts person to center",
      details: ["Safe identification", "Escort to center", "Family notification", "Reunion process"]
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
            Lost Person
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              {" "}Reporting Process
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Complete workflow from reporting to reunion - ensuring safe and efficient person recovery
          </p>
        </motion.div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8`}
            >
              {/* Step Content */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-2xl">{step.title}</h3>
                    <p className="text-gray-400">{step.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {step.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Representation */}
              <div className="flex-1">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-2xl">{index + 1}</span>
                    </div>
                    <h4 className="text-white font-semibold text-lg mb-2">Step {index + 1}</h4>
                    <p className="text-gray-400 text-sm">{step.title}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Process Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Complete Process Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <h4 className="text-white font-semibold text-sm mb-1">{step.title}</h4>
                  <p className="text-gray-400 text-xs">{step.description}</p>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block w-full h-0.5 bg-orange-500/30 mt-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ReportProcess;
