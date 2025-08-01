import React from "react";

interface Props {
  faces: string[];
}

const FacePreviewGrid: React.FC<Props> = ({ faces }) => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
      {faces.map((face, i) => (
        <div key={i} className="bg-white rounded-xl shadow hover:shadow-lg overflow-hidden">
          <img
            src={`${apiBaseUrl}/static/faces/${face}`}
            alt={`Detected Face ${i}`}
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="p-2 text-center text-sm font-medium text-gray-700">
            Face {i + 1}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FacePreviewGrid;