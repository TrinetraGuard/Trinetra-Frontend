import { getRouteMetadata } from "@/lib/metadata";
import { useLocation } from "react-router-dom";

interface PageHeaderProps {
  className?: string;
}

export default function PageHeader({ className = "" }: PageHeaderProps) {
  const location = useLocation();
  const metadata = getRouteMetadata(location.pathname);

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {metadata.title}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          {metadata.description}
        </p>
      </div>
    </div>
  );
} 