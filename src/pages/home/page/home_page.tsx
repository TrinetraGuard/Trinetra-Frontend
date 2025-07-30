import PageHeader from "@/components/ui/PageHeader";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader />
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Trinetra
            </h2>
            <p className="text-gray-600 mb-8">
              Your comprehensive security monitoring and management platform
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Security Monitoring</h3>
                <p className="text-blue-700 text-sm">Real-time threat detection and monitoring</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Analytics</h3>
                <p className="text-green-700 text-sm">Comprehensive security analytics and insights</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Management</h3>
                <p className="text-purple-700 text-sm">Centralized security management tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
