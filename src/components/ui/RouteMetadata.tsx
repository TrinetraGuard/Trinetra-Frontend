import { getRouteMetadata } from "@/lib/metadata";
import { useLocation } from "react-router-dom";

interface RouteMetadataProps {
  className?: string;
  showDescription?: boolean;
}

export default function RouteMetadata({ className = "", showDescription = true }: RouteMetadataProps) {
  const location = useLocation();
  const metadata = getRouteMetadata(location.pathname);

  return (
    <div className={`text-center ${className}`}>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {metadata.title}
      </h1>
      {showDescription && (
        <p className="text-gray-600">
          {metadata.description}
        </p>
      )}
    </div>
  );
} 