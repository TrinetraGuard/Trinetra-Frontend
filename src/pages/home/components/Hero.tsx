import PopupForm from "../../../components/ui/PopupForm";
import React from "react";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  githubRepo: string;
  linkedinUrl: string;
  domain: string;
  briefInfo: string;
}

const Hero: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const handleFormSubmit = (data: FormData) => {
    console.log("Team application submitted:", data);
    // Here you would typically send the application data to your API
    setIsFormOpen(false);
  };

  const openForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  const scrollToDocumentation = () => {
    const documentationSection = document.querySelector('[data-section="documentation"]');
    if (documentationSection) {
      documentationSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <>
      <div className="relative z-10 max-w-2xl md:ml-16 lg:ml-20">
        {/* Website Name with gradient outline */}
        <h1 className="text-6xl md:text-7xl font-black mb-6">
          <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
            Trinetra
          </span>
        </h1>
        
        {/* Tagline */}
        <h2 className="text-2xl md:text-3xl font-light text-white/90 mb-8 leading-relaxed">
          Making Pilgrimage Management
          <br />
          <span className="font-semibold text-white">Seamless, Transparent, and Open</span>
        </h2>
        
        {/* Description */}
        <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed">
          Advanced AI-powered security solutions designed to ensure safe and efficient pilgrimage experiences through cutting-edge technology and transparent operations.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={openForm}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Join Us
          </button>
          <button 
            onClick={scrollToDocumentation}
            className="border-2 border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm hover:bg-white/10"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Popup Form */}
      <PopupForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        title="Join Our Team"
        subtitle="We're excited to hear from you! Please fill out the form below and we'll get back to you soon."
      />
    </>
  );
};

export default Hero;
