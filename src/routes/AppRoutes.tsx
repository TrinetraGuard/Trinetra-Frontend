import { Route, Routes } from "react-router-dom";

import WlcomeAdmin from "@/components/admin/welcome";
import DashboardLayoutWrapper from "@/components/dashboard/layout/DashboardLayoutWrapper";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import Login from "@/pages/auth/Loginpage";
import Signup from "@/pages/auth/Signuppage";
import DashboardPage from "@/pages/dashboard";
import SettingsPage from "@/pages/dashboard/settings";
import UsersPage from "@/pages/dashboard/UsersPage";
import ErrorPage from "@/pages/error/error_page";
import CrowdControlPage from "@/pages/home/page/crowd_control_page";
import EmergencyPage from "@/pages/home/page/emergency_page";
import HomePage from "@/pages/home/page/home_page";
import LostFoundPage from "@/pages/home/page/lost_found_page";
import UserPage from "@/pages/home/page/user_page";
import VideoUploadPage from "@/pages/upload/VideoUploadPage";
import ProtectedRoute from "@/routes/ProtectedRoute";

const AppRoutes = () => {
  useDocumentTitle();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/crowd" element={<CrowdControlPage />} />
      <Route path="/lost-found" element={<LostFoundPage />} />
      <Route path="/emergency" element={<EmergencyPage />} />
      <Route path="/users" element={<UserPage />} />

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

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <DashboardLayoutWrapper />
          </ProtectedRoute>
        }
      >
        {/* Dashboard index route */}
        <Route index element={<WlcomeAdmin />} />
        
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