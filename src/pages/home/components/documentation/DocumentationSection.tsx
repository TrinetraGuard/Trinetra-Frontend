import { FaFilePdf } from "react-icons/fa";
import PDFPreview from "./PDFPreview";

const DocumentationSection = () => {
  const technicalDocs = [
    {
      title: "Trinetra Synopsis",
      description: "Complete project overview and system architecture documentation",
      pdfPath: "/pdf/Trinetra_Synopsis.pdf"
    },
    {
      title: "Face Detection System",
      description: "Technical documentation for face detection implementation",
      pdfPath: "/pdf/Facedetectionbykrutirishi-2.pdf"
    },
    {
      title: "Fast API Backend Framework",
      description: "Backend architecture and API documentation",
      pdfPath: "/pdf/Fast Api as a backend framework.pdf"
    }
  ];

  const userDocs = [
    {
      title: "Web-Based Lost and Found System",
      description: "User manual and system documentation",
      pdfPath: "/pdf/Web-Based Lost and Found System.pdf"
    },
    {
      title: "Crowd Control and Safety at Kumbh Mela",
      description: "Machine learning implementation for crowd control",
      pdfPath: "/pdf/Leveraging_Machine_Learning_for_Real-Time_Crowd_Control_and_Safety_at_Kumbh_Mela.pdf"
    },
    {
      title: "Kumbh Mela Impact Study",
      description: "Research on the influence of Kumbh Mela on Indian Society",
      pdfPath: "/pdf/Influence of Kumbh Mela on Indian Society.pdf"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaFilePdf className="text-purple-400" />
          Project Documentation
        </h3>
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              Technical Documentation
            </h4>
            <div className="space-y-3">
              {technicalDocs.map((doc, index) => (
                <PDFPreview
                  key={index}
                  title={doc.title}
                  description={doc.description}
                  pdfPath={doc.pdfPath}
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
              User Documentation
            </h4>
            <div className="space-y-3">
              {userDocs.map((doc, index) => (
                <PDFPreview
                  key={index}
                  title={doc.title}
                  description={doc.description}
                  pdfPath={doc.pdfPath}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationSection;
