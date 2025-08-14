import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import UserCTA from '../components/UserCTA';
import UserEmergency from '../components/UserEmergency';
import UserFeatures from '../components/UserFeatures';
import UserHero from '../components/UserHero';
import UserHowItWorks from '../components/UserHowItWorks';
import UserStats from '../components/UserStats';

const UserPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navbar />
      
      {/* Main Content */}
      <main className="pt-24">
        <UserHero />
        <UserStats />
        <UserFeatures />
        <UserHowItWorks />
        <UserEmergency />
        <UserCTA />
      </main>
      
      <Footer />
    </div>
  );
};

export default UserPage;