import React, { useState } from "react";

import PopupForm from "./PopupForm";

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

const PopupFormDemo: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleFormSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    // Here you would typically send the data to your API
    // For demo purposes, we're just logging it
  };

  const openForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Contact Form Demo
        </h2>
        <p className="text-gray-600 mb-8">
          Click the button below to open the popup contact form.
        </p>
        
        <button
          onClick={openForm}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Open Contact Form
        </button>
      </div>

      <PopupForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        title="Contact Us"
        subtitle="We'd love to hear from you. Send us a message and we'll respond as soon as possible."
      />
    </div>
  );
};

export default PopupFormDemo;
