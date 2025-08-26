import React, { useEffect, useState } from "react";

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

interface PopupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  title?: string;
  subtitle?: string;
}

const PopupForm: React.FC<PopupFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Get in Touch",
  subtitle = "We'd love to hear from you. Send us a message and we'll respond as soon as possible."
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    githubRepo: "",
    linkedinUrl: "",
    domain: "",
    briefInfo: ""
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Close popup when Escape key is pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Reset form when popup opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        githubRepo: "",
        linkedinUrl: "",
        domain: "",
        briefInfo: ""
      });
      setErrors({});
      setIsSubmitting(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.githubRepo.trim()) {
      newErrors.githubRepo = "GitHub repository URL is required";
    } else if (!/^https?:\/\/github\.com\/.+/.test(formData.githubRepo)) {
      newErrors.githubRepo = "Please enter a valid GitHub repository URL";
    }

    if (!formData.linkedinUrl.trim()) {
      newErrors.linkedinUrl = "LinkedIn URL is required";
    } else if (!/^https?:\/\/(www\.)?linkedin\.com\/.+/.test(formData.linkedinUrl)) {
      newErrors.linkedinUrl = "Please enter a valid LinkedIn URL";
    }

    if (!formData.domain.trim()) {
      newErrors.domain = "Domain/Area of expertise is required";
    }

    if (!formData.briefInfo.trim()) {
      newErrors.briefInfo = "Brief information is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
      
      if (!apiUrl) {
        throw new Error("Google Apps Script URL not configured");
      }

      await fetch(apiUrl, {
        method: "POST",
        mode: "no-cors", // Prevents CORS blocking
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Since no-cors doesn't return readable response, just assume success
      onSubmit(formData);
      setIsSuccess(true);

      // Removed auto-close - user will manually close the form

    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="text-gray-600 text-sm">{subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Success Message */}
        {isSuccess && (
          <div className="p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h3>
            
            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                <p className="text-gray-700 mb-3">
                  <span className="font-semibold text-green-700">✓ We have recorded your application</span>
                </p>
                <p className="text-gray-600 text-sm">
                  Our team will send you a confirmation email at:
                </p>
                <p className="text-orange-600 font-semibold text-lg mt-1">
                  {formData.email}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                <p className="text-gray-700 font-medium">
                  Our team will reach out to you soon with next steps.
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  We typically respond within 7-8 working Days.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {!isSuccess && (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Personal Information Section */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="firstName" className="block text-xs font-medium text-gray-600 mb-1">
                        First Name *
                      </label>
                                             <input
                         type="text"
                         id="firstName"
                         name="firstName"
                         value={formData.firstName}
                         onChange={handleInputChange}
                         className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 text-gray-900 ${
                           errors.firstName ? "border-red-300" : "border-gray-300"
                         }`}
                         placeholder="First name"
                       />
                      {errors.firstName && (
                        <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-xs font-medium text-gray-600 mb-1">
                        Last Name *
                      </label>
                                             <input
                         type="text"
                         id="lastName"
                         name="lastName"
                         value={formData.lastName}
                         onChange={handleInputChange}
                         className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 text-gray-900 ${
                           errors.lastName ? "border-red-300" : "border-gray-300"
                         }`}
                         placeholder="Last name"
                       />
                      {errors.lastName && (
                        <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1">
                        Email *
                      </label>
                                             <input
                         type="email"
                         id="email"
                         name="email"
                         value={formData.email}
                         onChange={handleInputChange}
                         className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 text-gray-900 ${
                           errors.email ? "border-red-300" : "border-gray-300"
                         }`}
                         placeholder="email@example.com"
                       />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-xs font-medium text-gray-600 mb-1">
                        Phone *
                      </label>
                                             <input
                         type="tel"
                         id="phone"
                         name="phone"
                         value={formData.phone}
                         onChange={handleInputChange}
                         className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 text-gray-900 ${
                           errors.phone ? "border-red-300" : "border-gray-300"
                         }`}
                         placeholder="+91 1234567890"
                       />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Professional Links Section */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Professional Links
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="githubRepo" className="block text-xs font-medium text-gray-600 mb-1">
                        GitHub Repository *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </div>
                                                 <input
                           type="url"
                           id="githubRepo"
                           name="githubRepo"
                           value={formData.githubRepo}
                           onChange={handleInputChange}
                           className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 text-gray-900 ${
                             errors.githubRepo ? "border-red-300" : "border-gray-300"
                           }`}
                           placeholder="github.com/username/repo"
                         />
                      </div>
                      {errors.githubRepo && (
                        <p className="mt-1 text-xs text-red-600">{errors.githubRepo}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="linkedinUrl" className="block text-xs font-medium text-gray-600 mb-1">
                        LinkedIn Profile *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </div>
                                                 <input
                           type="url"
                           id="linkedinUrl"
                           name="linkedinUrl"
                           value={formData.linkedinUrl}
                           onChange={handleInputChange}
                           className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 text-gray-900 ${
                             errors.linkedinUrl ? "border-red-300" : "border-gray-300"
                           }`}
                           placeholder="linkedin.com/in/username"
                         />
                      </div>
                      {errors.linkedinUrl && (
                        <p className="mt-1 text-xs text-red-600">{errors.linkedinUrl}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                                 {/* Domain Selection */}
                 <div className="bg-gray-50 p-4 rounded-xl">
                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                     <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                     </svg>
                     Expertise Area
                   </h3>
                   <div>
                     <label htmlFor="domain" className="block text-xs font-medium text-gray-600 mb-2">
                       Domain/Area of Expertise *
                     </label>
                     <div className="relative">
                       <select
                         id="domain"
                         name="domain"
                         value={formData.domain}
                         onChange={handleInputChange}
                         className={`w-full px-4 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none cursor-pointer bg-white ${
                           errors.domain ? "border-red-300" : "border-gray-300"
                         } ${formData.domain ? "text-gray-900" : "text-gray-500"}`}
                       >
                         <option value="" disabled>Choose your expertise area</option>
                         <optgroup label="Development">
                           <option value="frontend">🎨 Frontend Development</option>
                           <option value="backend">⚙️ Backend Development</option>
                           <option value="fullstack">🔄 Full Stack Development</option>
                           <option value="mobile">📱 Mobile Development</option>
                         </optgroup>
                         <optgroup label="Specialized Fields">
                           <option value="ai-ml">🤖 AI/ML Engineering</option>
                           <option value="devops">🚀 DevOps Engineering</option>
                           <option value="cybersecurity">🔒 Cybersecurity</option>
                           <option value="data-science">📊 Data Science</option>
                         </optgroup>
                         <optgroup label="Design & Management">
                           <option value="ui-ux">🎯 UI/UX Design</option>
                           <option value="product-management">📋 Product Management</option>
                         </optgroup>
                         <optgroup label="Other">
                           <option value="other">💡 Other</option>
                         </optgroup>
                       </select>
                       <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                         <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                         </svg>
                       </div>
                     </div>
                     {errors.domain && (
                       <p className="mt-2 text-xs text-red-600 flex items-center">
                         <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                         </svg>
                         {errors.domain}
                       </p>
                     )}
                     {formData.domain && !errors.domain && (
                       <p className="mt-2 text-xs text-green-600 flex items-center">
                         <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                         </svg>
                         Great choice! We're looking for {formData.domain.replace('-', ' ')} experts.
                       </p>
                     )}
                   </div>
                 </div>

                {/* Brief Information */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    About You
                  </h3>
                  <div>
                    <label htmlFor="briefInfo" className="block text-xs font-medium text-gray-600 mb-1">
                      Brief Information *
                    </label>
                                         <textarea
                       id="briefInfo"
                       name="briefInfo"
                       value={formData.briefInfo}
                       onChange={handleInputChange}
                       rows={6}
                       className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 resize-none bg-white text-gray-900 ${
                         errors.briefInfo ? "border-red-300" : "border-gray-300"
                       }`}
                       placeholder="Tell us about your experience, skills, projects, and why you'd like to join our team..."
                     />
                    {errors.briefInfo && (
                      <p className="mt-1 text-xs text-red-600">{errors.briefInfo}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PopupForm;
