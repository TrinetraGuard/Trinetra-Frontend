import { FaGraduationCap } from "react-icons/fa";
import PDFPreview from "./PDFPreview";

const ResearchPapers = () => {
  const academicPapers = [
    {
      title: " AI-Powered Crowd Safety at Religious Gatherings",
      description: "IEEE International Conference on Communication, Security, and Artificial Intelligence, 2025",
      pdfPath: "/pdf/Leveraging_Machine_Learning_for_Real-Time_Crowd_Control_and_Safety_at_Kumbh_Mela.pdf"
    },
    {
      title: "Web-Based Lost & Found Systems",
      description: "MIT International Journal of Computer Science and Information Technology, 2022",
      pdfPath: "/pdf/Web-Based Lost and Found System.pdf"
    },
    {
      title: "Cultural & Social Impact of Kumbh Mela",
      description: "Idealistic Journal of Advanced Research in Progressive Spectrums, 2025",
      pdfPath: "/pdf/Influence of Kumbh Mela on Indian Society.pdf"
    }
  ];

  const technicalPapers = [
    {
      title: "Real-Time Face Detection Using Computer Vision",
      description: "International Conference on Communication, Computing, and Internet of Things, 2023",
      pdfPath: "/pdf/Facedetectionbykrutirishi-2.pdf"
    },
    {
      title: " FastAPI for Modern Backend Development",
      description: "Bachelor’s Thesis, Tampere University of Applied Sciences, 2024",
      pdfPath: "/pdf/Fast Api as a backend framework.pdf"
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
