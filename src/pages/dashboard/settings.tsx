import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";

const SettingsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Notifications
                </label>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Alerts
                </label>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Two-Factor Authentication
                </label>
                <input type="checkbox" className="rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>4 hours</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
