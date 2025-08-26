import { FaCompress, FaDownload, FaExpand, FaEye, FaFilePdf, FaTimes } from "react-icons/fa";

import { useState } from "react";

interface PDFPreviewProps {
  title: string;
  description: string;
  pdfPath: string;
  onClose?: () => void;
}

const PDFPreview = ({ title, description, pdfPath, onClose }: PDFPreviewProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    console.log("Opening preview");
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    console.log("Closing preview");
    setIsPreviewOpen(false);
    setIsFullscreen(false);
    onClose?.();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closePreview();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-6 hover:from-gray-700/60 hover:to-gray-800/60 transition-all duration-300 cursor-pointer border border-gray-600/30 hover:border-gray-500/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl flex items-center justify-center border border-red-500/30 group-hover:from-red-500/30 group-hover:to-red-600/30 transition-all duration-300">
            <FaFilePdf className="text-red-400 text-lg group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-white font-semibold text-lg mb-1 truncate">{title}</h5>
            <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              className="p-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 rounded-xl transition-all duration-300 border border-blue-500/30 hover:border-blue-400/50 group/btn"
              title="Preview PDF"
            >
              <FaEye className="text-blue-400 text-sm group-hover/btn:scale-110 transition-transform duration-300" />
            </button>
            <button
              onClick={handleDownload}
              className="p-3 bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 rounded-xl transition-all duration-300 border border-green-500/30 hover:border-green-400/50 group/btn"
              title="Download PDF"
            >
              <FaDownload className="text-green-400 text-sm group-hover/btn:scale-110 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={handleBackdropClick}
        >
          <div className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-600/50 shadow-2xl transition-all duration-500 ${
            isFullscreen ? 'w-full h-full max-w-none max-h-none' : 'w-full max-w-7xl h-[95vh]'
          } flex flex-col relative overflow-hidden`}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-600/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl flex items-center justify-center border border-red-500/30">
                  <FaFilePdf className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">{title}</h3>
                  <p className="text-gray-400 text-sm">{description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                
                <button
                  onClick={toggleFullscreen}
                  className="p-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-xl transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? <FaCompress className="text-sm" /> : <FaExpand className="text-sm" />}
                </button>
                
              </div>
            </div>
            
            {/* PDF Viewer */}
            <div className="flex-1 p-6 bg-gray-900/50">
              <div className="w-full h-full rounded-xl overflow-hidden border border-gray-600/50 bg-white shadow-inner">
                <iframe
                  src={`${pdfPath}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-full"
                  title={title}
                />
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-600/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  PDF Ready
                </span>
                <span>•</span>
                <span>Click outside to close</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-blue-400/30"
                >
                  <FaDownload className="text-sm" />
                  Download PDF
                </button>
                <button
                  onClick={closePreview}
                  className="flex items-center gap-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-gray-500/30"
                >
                  <FaTimes className="text-sm" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PDFPreview;
