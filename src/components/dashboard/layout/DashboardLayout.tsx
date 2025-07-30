import Breadcrumbs from "./Breadcrumbs";
import PageHeader from "@/components/ui/PageHeader";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-muted">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Breadcrumbs />
        </div>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <PageHeader />
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export { DashboardLayout };
