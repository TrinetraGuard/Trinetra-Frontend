import { FaProjectDiagram } from "react-icons/fa";
import PDFPreview from "./PDFPreview";

const Synopsis = () => {
  const projectSynopsis = {
    title: "TrinetraGuard Project Synopsis",
    description: "Comprehensive project overview and technical specifications",
    pdfPath: "/pdf/Trinetra_Synopsis.pdf"
  };

  return (
    <div className="space-y-6">
      {/* Project Synopsis PDF */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaProjectDiagram className="text-blue-400" />
          Project Synopsis PDF
        </h3>
        <PDFPreview
          title={projectSynopsis.title}
          description={projectSynopsis.description}
          pdfPath={projectSynopsis.pdfPath}
        />
      </div>

      {/* Project Overview */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaProjectDiagram className="text-blue-400" />
          TrinetraGuard Project Overview
        </h3>
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Project Vision</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              AI-powered pilgrimage management platform with real-time crowd control, smart tracking, and predictive analytics for enhanced safety.
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Core Features</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• AI crowd management & smart tracking</li>
              <li>• Real-time coordination & predictive analytics</li>
              <li>• Multi-platform ecosystem (Mobile, Web, Admin)</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Tech Stack</h4>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-blue-400">React.js</span>
              <span className="text-blue-400">Node.js</span>
              <span className="text-blue-400">Firebase</span>
              <span className="text-blue-400">Python</span>
              <span className="text-blue-400">TensorFlow</span>
              <span className="text-blue-400">AWS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Components */}
     
    </div>
  );
};

export default Synopsis;
