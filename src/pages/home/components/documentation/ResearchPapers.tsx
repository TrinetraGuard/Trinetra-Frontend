import { FaGraduationCap } from "react-icons/fa";
import PDFPreview from "./PDFPreview";

const ResearchPapers = () => {
  const academicPapers = [
    {
      title: "Digital Transformation in Religious Tourism Management",
      description: "IEEE International Conference on Smart Cities, 2024",
      pdfPath: "/pdf/digital-transformation-religious-tourism.pdf"
    },
    {
      title: "AI-Powered Crowd Management Systems",
      description: "Journal of Computer Science & Engineering, 2024",
      pdfPath: "/pdf/ai-crowd-management.pdf"
    },
    {
      title: "Blockchain Security in Digital Identity Management",
      description: "International Journal of Information Security, 2024",
      pdfPath: "/pdf/blockchain-security-identity.pdf"
    }
  ];

  const technicalPapers = [
    {
      title: "Real-time Analytics for Large-scale Events",
      description: "Technical Report - TrinetraGuard Research Team",
      pdfPath: "/pdf/real-time-analytics-events.pdf"
    },
    {
      title: "Mobile Application Security Framework",
      description: "Security Analysis Report, 2024",
      pdfPath: "/pdf/mobile-security-framework.pdf"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaGraduationCap className="text-green-400" />
          Research Papers & Publications
        </h3>
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg">Academic Publications</h4>
            <div className="space-y-3">
              {academicPapers.map((paper, index) => (
                <PDFPreview
                  key={index}
                  title={paper.title}
                  description={paper.description}
                  pdfPath={paper.pdfPath}
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg">Technical Papers</h4>
            <div className="space-y-3">
              {technicalPapers.map((paper, index) => (
                <PDFPreview
                  key={index}
                  title={paper.title}
                  description={paper.description}
                  pdfPath={paper.pdfPath}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchPapers;
