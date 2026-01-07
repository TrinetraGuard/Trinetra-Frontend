import {
  Activity,
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  TrendingUp,
  UserCheck,
  Users,
  Video
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Timestamp, collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { db } from "@/firebase/firebase";

interface SOSAlert {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  activatedAt?: Timestamp;
  resolvedAt?: Timestamp;
  status?: 'active' | 'resolved';
  latitude?: number;
  longitude?: number;
  lastLocationUpdate?: Timestamp;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
  description?: string;
}

const StatCard = ({ title, value, change, icon: Icon, iconColor, bgColor, description }: StatCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg", bgColor)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change && (
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            {change}
          </p>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface ActivityItem {
  id: string;
  type: "alert" | "user" | "volunteer" | "event" | "place";
  title: string;
  description: string;
  time: string;
  status?: "active" | "resolved" | "pending";
}

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVolunteers: 0,
    activeAlerts: 0,
    resolvedAlerts: 0,
    totalPlaces: 0,
    totalEvents: 0,
    lostPeople: 0,
    systemStatus: "operational",
  });

  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Fetch Users
    const usersUnsub = onSnapshot(
      query(collection(db, "users"), where("role", "==", "user"), where("appName", "==", "Trinetra")),
      (snapshot) => {
        setStats((prev) => ({ ...prev, totalUsers: snapshot.size }));
      }
    );
    unsubscribers.push(usersUnsub);

    // Fetch Volunteers
    const volunteersUnsub = onSnapshot(
      query(collection(db, "users"), where("role", "==", "volunteer"), where("appName", "==", "Trinetra")),
      (snapshot) => {
        setStats((prev) => ({ ...prev, totalVolunteers: snapshot.size }));
      }
    );
    unsubscribers.push(volunteersUnsub);

    // Fetch SOS Alerts
    const alertsUnsub = onSnapshot(collection(db, "sos_alerts"), (snapshot) => {
      const alerts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SOSAlert));
      const active = alerts.filter((alert) => alert.status === "active").length;
      const resolved = alerts.filter((alert) => alert.status === "resolved").length;
      
      setStats((prev) => ({
        ...prev,
        activeAlerts: active,
        resolvedAlerts: resolved,
      }));

      // Add recent alerts to activities
      const recentAlerts = alerts
        .slice(0, 5)
        .map((alert) => ({
          id: alert.id,
          type: "alert" as const,
          title: `SOS Alert from ${alert.userName || "User"}`,
          description: alert.status === "active" ? "Active emergency alert" : "Alert resolved",
          time: alert.activatedAt?.toDate?.().toLocaleString() || new Date().toLocaleString(),
          status: alert.status,
        }));
      
      setRecentActivities((prev) => {
        const newActivities = [...recentAlerts, ...prev.filter((a) => a.type !== "alert")];
        return newActivities.slice(0, 10).sort((a, b) => b.time.localeCompare(a.time));
      });
    });
    unsubscribers.push(alertsUnsub);

    // Fetch Places
    const placesUnsub = onSnapshot(collection(db, "places"), (snapshot) => {
      setStats((prev) => ({ ...prev, totalPlaces: snapshot.size }));
    });
    unsubscribers.push(placesUnsub);

    // Fetch Events
    const eventsUnsub = onSnapshot(collection(db, "events"), (snapshot) => {
      setStats((prev) => ({ ...prev, totalEvents: snapshot.size }));
    });
    unsubscribers.push(eventsUnsub);

    // Fetch Lost People (from volunteer_alerts)
    const lostPeopleUnsub = onSnapshot(collection(db, "volunteer_alerts"), (snapshot) => {
      setStats((prev) => ({ ...prev, lostPeople: snapshot.size }));
    });
    unsubscribers.push(lostPeopleUnsub);

    setLoading(false);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "alert":
        return AlertCircle;
      case "user":
        return Users;
      case "volunteer":
        return UserCheck;
      case "event":
        return Calendar;
      case "place":
        return MapPin;
      default:
        return FileText;
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "alert":
        return "text-red-600 bg-red-50";
      case "user":
        return "text-blue-600 bg-blue-50";
      case "volunteer":
        return "text-green-600 bg-green-50";
      case "event":
        return "text-purple-600 bg-purple-50";
      case "place":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your system.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">System Operational</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change="+12% from last month"
          icon={Users}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          description="Registered users in the system"
        />
        <StatCard
          title="Active Volunteers"
          value={stats.totalVolunteers}
          change="+5 new this week"
          icon={UserCheck}
          iconColor="text-green-600"
          bgColor="bg-green-50"
          description="Volunteers available for assistance"
        />
        <StatCard
          title="Active SOS Alerts"
          value={stats.activeAlerts}
          change={`${stats.resolvedAlerts} resolved`}
          icon={AlertCircle}
          iconColor="text-red-600"
          bgColor="bg-red-50"
          description="Emergency alerts requiring attention"
        />
        <StatCard
          title="Lost People Reports"
          value={stats.lostPeople}
          icon={UserCheck}
          iconColor="text-orange-600"
          bgColor="bg-orange-50"
          description="Active missing person reports"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Places Managed"
          value={stats.totalPlaces}
          icon={MapPin}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
          description="Places in the system"
        />
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          icon={Calendar}
          iconColor="text-indigo-600"
          bgColor="bg-indigo-50"
          description="Events scheduled"
        />
        <StatCard
          title="System Uptime"
          value="99.9%"
          icon={Activity}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
          description="Last 30 days"
        />
        <StatCard
          title="Crowd Monitoring"
          value="Active"
          icon={Video}
          iconColor="text-cyan-600"
          bgColor="bg-cyan-50"
          description="Real-time monitoring enabled"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest updates and events in your system</CardDescription>
              </div>
              <Link
                to="/dashboard/sos-alerts"
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className={cn("p-2 rounded-lg", getActivityColor(activity.type))}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          {activity.status && (
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                activity.status === "active"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              )}
                            >
                              {activity.status}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link
                to="/dashboard/sos-alerts"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all group"
              >
                <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">View SOS Alerts</p>
                  <p className="text-xs text-gray-500">Manage emergency alerts</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </Link>

              <Link
                to="/dashboard/crowd-control"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all group"
              >
                <div className="p-2 bg-cyan-50 rounded-lg group-hover:bg-cyan-100 transition-colors">
                  <Video className="h-5 w-5 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Crowd Monitoring</p>
                  <p className="text-xs text-gray-500">Real-time CCTV monitoring</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </Link>

              <Link
                to="/dashboard/users"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all group"
              >
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Manage Users</p>
                  <p className="text-xs text-gray-500">View and manage users</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </Link>

              <Link
                to="/dashboard/volunteers"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all group"
              >
                <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Volunteers</p>
                  <p className="text-xs text-gray-500">Manage volunteers</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </Link>

              <Link
                to="/dashboard/add-places"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all group"
              >
                <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Add Places</p>
                  <p className="text-xs text-gray-500">Add new places</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </Link>

              <Link
                to="/dashboard/lost-people"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all group"
              >
                <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                  <UserCheck className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Lost People</p>
                  <p className="text-xs text-gray-500">Manage lost person reports</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system status and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Database</p>
                    <p className="text-xs text-gray-500">Connected and operational</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-green-700">Healthy</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">CCTV Monitoring</p>
                    <p className="text-xs text-gray-500">All cameras active</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-green-700">Active</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Alert System</p>
                    <p className="text-xs text-gray-500">Real-time notifications enabled</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-green-700">Operational</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">API Services</p>
                    <p className="text-xs text-gray-500">All endpoints responding</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-green-700">Online</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
            <CardDescription>Important statistics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">98.5%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "98.5%" }}></div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="text-sm text-gray-600">Average Response Time</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">1.2 min</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "95%" }}></div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="text-sm text-gray-600">System Efficiency</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">99.2%</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: "99.2%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
