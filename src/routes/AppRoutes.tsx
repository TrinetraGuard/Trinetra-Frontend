import { Route, Routes } from "react-router-dom";

import DashboardPage from "@/pages/dashboard";
import ErrorPage from "@/pages/error/error_page";
import HomePage from "@/pages/home/page/home_page";
import Login from "@/pages/auth/Loginpage";
import ProtectedRoute from "@/routes/ProtectedRoute";
import SettingsPage from "@/pages/dashboard/settings";
import Signup from "@/pages/auth/Signuppage";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const AppRoutes = () => {
  useDocumentTitle();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default AppRoutes; 