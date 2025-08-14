import { FaChevronDown, FaQuestionCircle } from "react-icons/fa";

import { useState } from "react";
import ContactSupportForm from "../../../components/ui/ContactSupportForm";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: "general" | "technical" | "security" | "deployment";
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  priority: "low" | "medium" | "high";
  category: "general" | "technical" | "security" | "deployment" | "billing" | "other";
}

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  const faqData: FAQItem[] = [
    // General Questions
    {
      id: 1,
      question: "What is TrinetraGuard?",
      answer: "TrinetraGuard is an advanced AI-powered security solution designed specifically for pilgrimage management. It ensures safe and efficient pilgrimage experiences through cutting-edge technology, real-time monitoring, and transparent operations.",
      category: "general"
    },
    {
      id: 2,
      question: "How does TrinetraGuard improve pilgrimage safety?",
      answer: "TrinetraGuard uses AI-powered crowd monitoring, real-time face detection, emergency response systems, and comprehensive data analytics to prevent incidents, manage crowds efficiently, and provide immediate assistance during emergencies.",
      category: "general"
    },
    {
      id: 3,
      question: "Is TrinetraGuard suitable for all types of religious gatherings?",
      answer: "Yes, TrinetraGuard is designed to be adaptable for various religious gatherings and large-scale events. The system can be customized based on specific requirements, venue size, and crowd density.",
      category: "general"
    },

    // Technical Questions
    {
      id: 4,
      question: "What technologies does TrinetraGuard use?",
      answer: "TrinetraGuard leverages machine learning algorithms, computer vision, real-time data processing, blockchain for transparency, and IoT devices including CCTV cameras, LED displays, and mobile applications for comprehensive monitoring.",
      category: "technical"
    },
    {
      id: 5,
      question: "How accurate is the AI face detection system?",
      answer: "Our AI face detection system achieves over 95% accuracy in real-time conditions. It's trained on diverse datasets and continuously improves through machine learning algorithms to handle various lighting conditions and crowd densities.",
      category: "technical"
    },
    {
      id: 6,
      question: "Can TrinetraGuard integrate with existing security systems?",
      answer: "Yes, TrinetraGuard is designed with open APIs and modular architecture, making it compatible with existing CCTV systems, access control systems, and emergency response infrastructure.",
      category: "technical"
    },

    // Security Questions
    {
      id: 7,
      question: "How does TrinetraGuard protect user privacy?",
      answer: "TrinetraGuard implements end-to-end encryption, anonymized data processing, and strict access controls. Personal data is processed in compliance with privacy regulations and can be automatically deleted after events.",
      category: "security"
    },
    {
      id: 8,
      question: "What security measures are in place for data protection?",
      answer: "We use industry-standard encryption, secure cloud infrastructure, regular security audits, and comply with international data protection standards. All data transmission is encrypted and stored securely.",
      category: "security"
    },
    {
      id: 9,
      question: "How does the system handle false alarms?",
      answer: "Our AI system uses multiple validation layers and human oversight to minimize false alarms. The system learns from corrections and continuously improves its accuracy over time.",
      category: "security"
    },

    // Deployment Questions
    {
      id: 10,
      question: "How long does it take to deploy TrinetraGuard?",
      answer: "Standard deployment takes 2-4 weeks depending on venue size and requirements. We provide comprehensive training and support to ensure smooth operation from day one.",
      category: "deployment"
    },
    {
      id: 11,
      question: "What infrastructure is required for TrinetraGuard?",
      answer: "TrinetraGuard requires internet connectivity, power supply, and basic network infrastructure. We provide detailed requirements and can assist with infrastructure setup and optimization.",
      category: "deployment"
    },
    {
      id: 12,
      question: "Do you provide training and support?",
      answer: "Yes, we provide comprehensive training for administrators, security personnel, and technical staff. Our support team is available 24/7 for technical assistance and maintenance.",
      category: "deployment"
    }
  ];

  const categories = [
    { id: "all", name: "All Questions", count: faqData.length },
    { id: "general", name: "General", count: faqData.filter(item => item.category === "general").length },
    { id: "technical", name: "Technical", count: faqData.filter(item => item.category === "technical").length },
    { id: "security", name: "Security", count: faqData.filter(item => item.category === "security").length },
    { id: "deployment", name: "Deployment", count: faqData.filter(item => item.category === "deployment").length }
  ];

  const filteredFAQs = activeCategory === "all" 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory);

  // Show only 3 questions initially, or all if showAllQuestions is true
  const displayedFAQs = showAllQuestions ? filteredFAQs : filteredFAQs.slice(0, 3);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "general": return "from-blue-500 to-cyan-500";
      case "technical": return "from-purple-500 to-pink-500";
      case "security": return "from-red-500 to-orange-500";
      case "deployment": return "from-green-500 to-emerald-500";
      default: return "from-gray-500 to-gray-700";
    }
  };

  const handleContactSubmit = async (data: ContactFormData) => {
    console.log("Contact form submitted:", data);
    // Here you would typically send the contact form data to your API
    // For demo purposes, we're just logging it
  };

  const openContactForm = () => {
    setIsContactFormOpen(true);
  };

  const closeContactForm = () => {
    setIsContactFormOpen(false);
  };

  const toggleShowAll = () => {
    setShowAllQuestions(!showAllQuestions);
    // Close all open items when toggling view
    setOpenItems([]);
  };

  return (
    <>
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,48,0.1),transparent_50%)]"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 px-6 py-2 rounded-full border border-orange-500/30 mb-4">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <span className="text-orange-400 text-sm font-medium">FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about TrinetraGuard. Can't find what you're looking for? Contact our support team.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setShowAllQuestions(false); // Reset to show only 3 when changing category
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  activeCategory === category.id
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600/50 hover:border-orange-500/50"
                }`}
              >
                {category.name}
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                  {category.count}
                </span>
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="max-w-4xl mx-auto space-y-4">
            {displayedFAQs.map((item) => (
              <div
                key={item.id}
                className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 bg-gradient-to-br ${getCategoryColor(item.category)} rounded-xl flex items-center justify-center border border-white/20`}>
                      <FaQuestionCircle className="text-white text-sm" />
                    </div>
                    <h3 className="text-white font-semibold text-lg group-hover:text-orange-400 transition-colors duration-300">
                      {item.question}
                    </h3>
                  </div>
                  <div className={`w-6 h-6 text-gray-400 transition-all duration-300 ${
                    openItems.includes(item.id) ? 'rotate-180 text-orange-400' : ''
                  }`}>
                    <FaChevronDown className="w-full h-full" />
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openItems.includes(item.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-6">
                    <div className="pl-14">
                      <p className="text-gray-300 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View More/Less Button */}
          {filteredFAQs.length > 3 && (
            <div className="text-center mt-8">
              <button
                onClick={toggleShowAll}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-orange-600/20 hover:from-orange-500/30 hover:to-orange-600/30 text-orange-400 hover:text-orange-300 rounded-xl font-semibold transition-all duration-300 border border-orange-500/30 hover:border-orange-400/50"
              >
                {showAllQuestions ? (
                  <>
                    <span>View Less</span>
                    <FaChevronDown className="w-4 h-4 rotate-180 transition-transform duration-300" />
                  </>
                ) : (
                  <>
                    <span>View More ({filteredFAQs.length - 3} more questions)</span>
                    <FaChevronDown className="w-4 h-4 transition-transform duration-300" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-16">
            <div className="bg-gradient-to-br from-orange-500/15 via-orange-600/10 to-orange-500/5 border border-orange-500/30 rounded-3xl p-10 max-w-6xl mx-auto shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-12">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center border border-orange-400/30">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold text-white">
                      Still have questions?
                    </h3>
                  </div>
                  <p className="text-gray-200 text-xl leading-relaxed mb-6">
                    Our dedicated support team is here to help you with any specific questions about TrinetraGuard. We're available 24/7 to provide expert assistance and ensure you get the answers you need.
                  </p>
                  <div className="flex items-center gap-6 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>24/7 Support Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span>Expert Team</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span>Quick Response</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <button 
                    onClick={openContactForm}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border border-orange-400/30 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Support
                  </button>
                  <p className="text-orange-300 text-sm font-medium">
                    Get help within hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support Form */}
      <ContactSupportForm
        isOpen={isContactFormOpen}
        onClose={closeContactForm}
        onSubmit={handleContactSubmit}
      />
    </>
  );
};

export default FAQ;
