import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading, setIntendedPath } = useAuth();
  const location = useLocation();

  if (!user && !loading) {
    setIntendedPath(location.pathname); // Save the target path before redirecting
    return <Navigate to="/login" replace />;
  }

  if (loading) return null; // Render nothing while checking

  return children;
};

export default ProtectedRoute;