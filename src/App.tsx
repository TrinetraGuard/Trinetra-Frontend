import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import DashboardPage from "./pages/dashboard";
import ErrorPage from "./pages/error/error_page";
import HomePage from "./pages/home/page/home_page";
import Login from "./pages/auth/Loginpage";
import ProtectedRoute from "./routes/ProtectedRoute";
import Signup from "./pages/auth/Signuppage";

const App = () => {
  return (
    <AuthProvider>
      
    <BrowserRouter>
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

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
};

export default App;