import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-2">Welcome to Dashboard</h1>
      <p className="text-muted-foreground">This is your dashboard overview.</p>
    </DashboardLayout>
  );
};

export default DashboardPage;