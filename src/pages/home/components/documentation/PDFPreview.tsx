import { FaDownload, FaEye, FaFilePdf, FaTimes } from "react-icons/fa";

import { useState } from "react";

interface PDFPreviewProps {
  title: string;
  description: string;
  pdfPath: string;
  onClose?: () => void;
}

const PDFPreview = ({ title, description, pdfPath, onClose }: PDFPreviewProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const closePreview = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsPreviewOpen(false);
    onClose?.();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closePreview();
    }
  };

  return (
    <>
      <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
            <FaFilePdf className="text-red-400" />
          </div>
          <div className="flex-1">
            <h5 className="text-white font-medium">{title}</h5>
            <p className="text-gray-300 text-sm">{description}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors "
              title="Preview PDF"
            >
              <FaEye className="text-blue-400 text-sm" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors"
              title="Download PDF"
            >
              <FaDownload className="text-green-400 text-sm" />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-gray-800 rounded-xl w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h3 className="text-white font-semibold">{title}</h3>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors hover:bg-red-500/20 hover:text-red-400"
                title="Close Preview"
              >
                <FaTimes className="text-gray-400" />
              </button>
            </div>
            
            {/* PDF Viewer */}
            <div className="flex-1 p-4">
              <iframe
                src={`${pdfPath}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full rounded-lg border border-gray-600"
                title={title}
              />
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-600">
              <p className="text-gray-300 text-sm">{description}</p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaDownload className="text-sm" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PDFPreview;
