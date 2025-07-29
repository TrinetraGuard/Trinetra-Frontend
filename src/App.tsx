import { BrowserRouter, Route, Routes } from "react-router-dom";

import ErrorPage from "./pages/error/error_page";
import HomePage from "./pages/home/page/home_page";
import Login from "./pages/auth/Loginpage";
import Signup from "./pages/auth/Signuppage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> 
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
