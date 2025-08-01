const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Security Status</h3>
          <p className="text-blue-700 text-sm">All systems operational</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">Active Alerts</h3>
          <p className="text-green-700 text-sm">No critical alerts</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-2">System Health</h3>
          <p className="text-purple-700 text-sm">100% uptime</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;