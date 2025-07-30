import { Link, useLocation } from "react-router-dom";

import { ChevronRight } from "lucide-react";

export default function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);

  return (
    <nav>
      <ol className="flex items-center space-x-2 text-sm mt-3">
        <li>
          <Link 
            to="/" 
            className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
          >
            Home
          </Link>
        </li>
        
        {paths.map((segment, idx) => {
          const path = "/" + paths.slice(0, idx + 1).join("/");
          const isLast = idx === paths.length - 1;
          return (
            <li key={path} className="flex items-center space-x-2">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              {isLast ? (
                <span className="text-gray-900 font-semibold">
                  {segment.charAt(0).toUpperCase() + segment.slice(1)}
                </span>
              ) : (
                <Link 
                  to={path} 
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium capitalize"
                >
                  {segment.charAt(0).toUpperCase() + segment.slice(1)}
                </Link>
                
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { Breadcrumbs };
