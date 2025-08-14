import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import FoundPersons from './components/FoundPersons';
import LostFoundHero from './components/LostFoundHero';
import ReportProcess from './components/ReportProcess';
import SearchSystem from './components/SearchSystem';
import VolunteerCoordination from './components/VolunteerCoordination';

const LostFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navbar />
      
      {/* Main Content */}
      <main className="pt-24">
        <LostFoundHero />
        <ReportProcess />
        <SearchSystem />
        <VolunteerCoordination />
        <FoundPersons />
      </main>
      
      <Footer />
    </div>
  );
};

export default LostFoundPage;