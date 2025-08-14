import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import AlertSystem from './components/AlertSystem';
import DataAnalytics from './components/DataAnalytics';
import FeaturesOverview from './components/FeaturesOverview';
import HeroSection from './components/HeroSection';
import LiveMonitoring from './components/LiveMonitoring';

const CrowdControlPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navbar />
      
      {/* Main Content */}
      <main className="pt-24">
        <HeroSection />
        <FeaturesOverview />
        <LiveMonitoring />
        <AlertSystem />
        <DataAnalytics />
      </main>
      
      <Footer />
    </div>
  );
};

export default CrowdControlPage;