import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import EmergencyFeatures from "./components/EmergencyFeatures";
import EmergencyFlow from "./components/EmergencyFlow";
import EmergencyHero from "./components/EmergencyHero";
import EmergencyResponse from "./components/EmergencyResponse";
import EmergencyStats from "./components/EmergencyStats";

const EmergencyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navbar />
      
      {/* Hero Section */}
      <EmergencyHero />
      
      {/* Emergency Flow Section */}
      <EmergencyFlow />
      
      {/* Emergency Features */}
      <EmergencyFeatures />
      
      {/* Emergency Response System */}
      <EmergencyResponse />
      
      {/* Emergency Statistics */}
      <EmergencyStats />
      
      <Footer />
    </div>
  );
};

export default EmergencyPage;