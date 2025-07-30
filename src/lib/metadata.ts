export interface RouteMetadata {
  title: string;
  description: string;
}

export const routeMetadata: Record<string, RouteMetadata> = {
  "/": {
    title: "Home",
    description: "Welcome to Trinetra - Your security dashboard"
  },
  "/login": {
    title: "Login",
    description: "Sign in to your Trinetra account"
  },
  "/signup": {
    title: "Sign Up",
    description: "Create a new Trinetra account"
  },
  "/dashboard": {
    title: "Dashboard",
    description: "Main dashboard overview and analytics"
  },
  "/dashboard/settings": {
    title: "Settings",
    description: "Manage your account settings and preferences"
  },
  "/dashboard/users": {
    title: "Users",
    description: "Manage user accounts and permissions"
  },
  "/dashboard/reports": {
    title: "Reports",
    description: "View and generate security reports"
  }
};

export const getRouteMetadata = (pathname: string): RouteMetadata => {
  // Try to get exact match first
  if (routeMetadata[pathname]) {
    return routeMetadata[pathname];
  }
  
  // Fallback for dynamic routes or unknown paths
  return {
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist"
  };
}; 