import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

const DashboardLayoutWrapper: React.FC = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default DashboardLayoutWrapper; 