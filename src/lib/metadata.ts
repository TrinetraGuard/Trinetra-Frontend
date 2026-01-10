export interface RouteMetadata {
  title: string;
  description: string;
}

export const routeMetadata: Record<string, RouteMetadata> = {
  "/": {
    title: "Home",
    description: "Welcome to Trinetra - Your security dashboard",
  },
  "/login": {
    title: "Login",
    description: "Sign in to your Trinetra account",
  },
  "/signup": {
    title: "Sign Up",
    description: "Create a new Trinetra account",
  },
  "/dashboard": {
    title: "Dashboard",
    description: "Main dashboard overview and analytics",
  },
  "/dashboard/settings": {
    title: "Settings",
    description: "Manage your account settings and preferences",
  },
  "/dashboard/users": {
    title: "Users",
    description: "Manage user accounts and permissions",
  },
  "/dashboard/reports": {
    title: "Reports",
    description: "View and generate security reports",
  },
  "/dashboard/upload": {
    title: "Upload",
    description: "Upload a video to the dashboard",
  },
  "/emergency": {
    title: "Emergency",
    description: "Emergency page",
  },
  "/crowd": {
    title: "Crowd",
    description: "Crowd page",
  },
  "/lost-found": {
    title: "Lost & Found",
    description: "Lost & Found page",
  },
  "/users": {
    title: "Users",
    description: "Users page",
  },
  "/dashboard/lost-people": {
    title: "Lost Peoples",
    description: "Lost People page",
  },
  "/dashboard/volunteer-user": {
    title: "Lost People",
    description: "Lost People page",
  },
  "/dashboard/volunteers": {
    title: "Volunteers",
    description: "Volunteers page",
  },
  "/dashboard/volunteers-map": {
    title: "Volunteers Map",
    description: "Volunteers Map page",
  },
  "/dashboard/volunteer-area": {
    title: "Volunteer Area",
    description: "Volunteer Area page",
  },
  "/dashboard/section-categories": {
    title: "Categories",
    description: "Categories page",
  },
  "/dashboard/section-event": {
    title: "Event's",
    description: "Event's page",
  },
  "/dashboard/add-event": {
    title: "Add Event",
    description: "Add new events to the pilgrimage calendar",
  },
  "/dashboard/edit-event": {
    title: "Edit Event",
    description: "Edit and manage existing events",
  },
  "/dashboard/section-features": {
    title: "Features",
    description: "Features page",
  },
  "/dashboard/add-places": {
    title: "Add Places",
    description: "Add new places to the system",
  },
  "/dashboard/update-places": {
    title: "Update Places",
    description: "Update existing places",
  },
  "/dashboard/sos-alerts": {
    title: "SOS Alerts",
    description: "Manage emergency SOS alerts, track user locations, and coordinate with nearby volunteers",
  },
  "/dashboard/users-map": {
    title: "Users Map",
    description: "Users Map page",
  },
  "/dashboard/feature-post": {
    title: "Feature Post",
    description: "Feature Post page",
  },
  "/dashboard/cctv-management": {
    title: "CCTV Management",
    description: "Manage CCTV cameras, add RTSP links, and monitor camera status",
  },
  "/dashboard/crowd-control": {
    title: "Crowd Monitoring",
    description: "Real-time monitoring of all CCTV cameras for crowd management",
  },
  "/dashboard/live-analytics": {
    title: "Live Analytics",
    description: "Real-time crowd analysis and density monitoring with AI-powered insights",
  },
  "/dashboard/crowd-density": {
    title: "Crowd Density Analysis",
    description: "Comprehensive crowd density monitoring and analysis across all locations",
  },
  "/dashboard/crowd-logs": {
    title: "Crowd Logs",
    description: "Historical crowd data and time-based analysis for all monitored locations",
  },
  "/dashboard/crowd-predictions": {
    title: "Crowd Predictions",
    description: "AI-powered crowd forecasting based on historical patterns and predictive analytics",
  },
};

export const getRouteMetadata = (pathname: string): RouteMetadata => {
  // Try to get exact match first
  if (routeMetadata[pathname]) {
    return routeMetadata[pathname];
  }

  // Fallback for dynamic routes or unknown paths
  return {
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist",
  };
};
