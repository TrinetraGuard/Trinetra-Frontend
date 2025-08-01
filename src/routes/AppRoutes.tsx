import { Route, Routes } from "react-router-dom";

import DashboardLayoutWrapper from "@/components/dashboard/layout/DashboardLayoutWrapper";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import Login from "@/pages/auth/Loginpage";
import Signup from "@/pages/auth/Signuppage";
import DashboardPage from "@/pages/dashboard";
import SettingsPage from "@/pages/dashboard/settings";
import UsersPage from "@/pages/dashboard/UsersPage";
import ErrorPage from "@/pages/error/error_page";
import HomePage from "@/pages/home/page/home_page";
import VideoUploadPage from "@/pages/upload/VideoUploadPage";
import ProtectedRoute from "@/routes/ProtectedRoute";

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
      
      {/* Dashboard Routes with nested sub-routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayoutWrapper />
          </ProtectedRoute>
        }
      >
        {/* Dashboard index route */}
        <Route index element={<DashboardPage />} />
        
        {/* Dashboard sub-routes */}
        <Route path="settings" element={<SettingsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="upload" element={<VideoUploadPage />} />
      </Route>
      
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default AppRoutes; 