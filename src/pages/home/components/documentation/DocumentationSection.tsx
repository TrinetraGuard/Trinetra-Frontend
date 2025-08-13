import { FaFilePdf } from "react-icons/fa";
import PDFPreview from "./PDFPreview";

const DocumentationSection = () => {
  const technicalDocs = [
    {
      title: "System Architecture",
      description: "Complete system design and architecture documentation",
      pdfPath: "/pdf/system-architecture.pdf"
    },
    {
      title: "API Documentation",
      description: "RESTful API endpoints and usage guide",
      pdfPath: "/pdf/api-documentation.pdf"
    },
    {
      title: "Database Schema",
      description: "Database design and relationships documentation",
      pdfPath: "/pdf/database-schema.pdf"
    }
  ];

  const userDocs = [
    {
      title: "User Manual",
      description: "Complete user guide and instructions",
      pdfPath: "/pdf/user-manual.pdf"
    },
    {
      title: "Admin Guide",
      description: "Administrator panel documentation",
      pdfPath: "/pdf/admin-guide.pdf"
    },
    {
      title: "Deployment Guide",
      description: "Installation and deployment instructions",
      pdfPath: "/pdf/deployment-guide.pdf"
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
