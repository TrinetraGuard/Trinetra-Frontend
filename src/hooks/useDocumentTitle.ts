import { defaultSiteDescription, getRouteMetadata } from "@/lib/metadata";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DESCRIPTION_SELECTOR = 'meta[name="description"]';

export const useDocumentTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const metadata = getRouteMetadata(location.pathname);
    document.title = `${metadata.title} - Trinetra`;

    const el = document.querySelector(DESCRIPTION_SELECTOR) as HTMLMetaElement | null;
    if (el) {
      const content = metadata.description?.trim() || defaultSiteDescription;
      el.setAttribute("content", content);
    }
  }, [location.pathname]);
};
