import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import AboutHero from './components/AboutHero';
import ContactSection from './components/ContactSection';
import MissionVision from './components/MissionVision';
import ProjectOverview from './components/ProjectOverview';
import TeamSection from './components/TeamSection';
import ValuesSection from './components/ValuesSection';

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navbar />
      
      {/* Main Content */}
      <main className="pt-24">
        <AboutHero />
        <MissionVision />
        <TeamSection />
        <ProjectOverview />
        <ValuesSection />
        <ContactSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutUsPage;