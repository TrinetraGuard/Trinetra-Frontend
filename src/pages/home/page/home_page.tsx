import Documentation from "../components/Documentation";
import FlowDiagram from "../components/FlowDiagram";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import TeamMembers from "../components/TeamMembers";

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div 
        className="relative flex flex-col items-center justify-center h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/img/bg.jpg')" }}
      >
        {/* Blur overlay */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
        
        {/* Hero Section - Left Aligned */}
        <div className="relative z-10 flex items-center h-full w-full ">
          <div className="px-6 md:px-12 lg:px-16">
            <Hero />
          </div>
        </div>
      </div>
      
      {/* Flow Diagram Section */}
      <FlowDiagram />
      
      {/* Documentation Section */}
      <Documentation />
      
      {/* Team Members Section */}
      <TeamMembers />
    </div>
  );
};

export default HomePage;
