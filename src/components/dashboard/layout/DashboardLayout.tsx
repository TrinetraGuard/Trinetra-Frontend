import Breadcrumbs from "./Breadcrumbs";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 bg-muted flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-none">
          <Breadcrumbs />
        </div>
        <div className="p-6 flex-1 overflow-auto">
          <div className="bg-white rounded-lg shadow p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export { DashboardLayout };
