import { getRouteMetadata } from "@/lib/metadata";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useDocumentTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const metadata = getRouteMetadata(location.pathname);
    document.title = `${metadata.title} - Trinetra`;
  }, [location.pathname]);
}; 