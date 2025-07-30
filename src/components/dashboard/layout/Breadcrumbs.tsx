import { Link, useLocation } from "react-router-dom";

export default function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);

  return (
    <nav className="text-sm text-muted-foreground mb-4">
      <ol className="flex space-x-2">
        <li><Link to="/" className="hover:underline">Home</Link></li>
        {paths.map((segment, idx) => {
          const path = "/" + paths.slice(0, idx + 1).join("/");
          const isLast = idx === paths.length - 1;
          return (
            <li key={path} className="flex items-center space-x-2">
              <span>/</span>
              {isLast ? (
                <span className="font-semibold">{segment}</span>
              ) : (
                <Link to={path} className="hover:underline capitalize">
                  {segment}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}