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
  "/dashboard/section-features": {
    title: "Features",
    description: "Features page",
  },
  "/dashboard/section-place": {
    title: "Places",
    description: "Places page",
  },
  "/dashboard/sos-alerts": {
    title: "SOS Alerts",
    description: "SOS Alerts page",
  },
  "/dashboard/users-map": {
    title: "Users Map",
    description: "Users Map page",
  },
  "/dashboard/feature-post": {
    title: "Feature Post",
    description: "Feature Post page",
  },
  "/dashboard/crowd-control": {
    title: "Crowd Control",
    description: "crowd control page",
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
