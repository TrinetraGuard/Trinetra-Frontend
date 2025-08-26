import Navbar from "@/pages/home/components/Navbar";
import React from "react";
import { Outlet } from "react-router-dom";

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
