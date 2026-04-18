export interface RouteMetadata {
  title: string;
  description: string;
}

/** Default site description when a route has no specific entry (should not happen for known routes). */
export const defaultSiteDescription =
  "Trinetra — pilgrimage security, crowd management, heritage content, SOS alerts, and real-time monitoring for Nashik and beyond.";

export const routeMetadata: Record<string, RouteMetadata> = {
  "/": {
    title: "Home",
    description:
      "Trinetra pilgrimage platform: discover places, events, safety tools, and real-time crowd insights.",
  },
  "/login": {
    title: "Sign in",
    description: "Sign in to the Trinetra admin dashboard and tools.",
  },
  "/signup": {
    title: "Create account",
    description: "Create a Trinetra account to access dashboard and volunteer features.",
  },
  "/about-us": {
    title: "About us",
    description: "Learn about Trinetra, our mission, and the pilgrimage security platform.",
  },
  "/account-deletion-request": {
    title: "Request account deletion",
    description: "Submit a request to delete your Trinetra account and associated personal data.",
  },
  "/crowd": {
    title: "Crowd information",
    description: "Public crowd and safety information for pilgrims and visitors.",
  },
  "/lost-found": {
    title: "Lost & found",
    description: "Report or search for lost items and people during pilgrimage events.",
  },
  "/emergency": {
    title: "Emergency",
    description: "Emergency contacts and safety guidance for pilgrims.",
  },
  "/users": {
    title: "Users",
    description: "Trinetra user-facing tools and account access.",
  },

  "/dashboard": {
    title: "Dashboard",
    description: "Admin overview: quick stats, heritage content, places, events, and operations.",
  },
  "/dashboard/settings": {
    title: "Settings",
    description: "Account and application preferences for the admin panel.",
  },
  "/dashboard/users": {
    title: "Users",
    description: "View and manage registered users and roles.",
  },
  "/dashboard/upload": {
    title: "Video upload",
    description: "Upload and manage video assets for the dashboard.",
  },
  "/dashboard/lost-people": {
    title: "Lost people",
    description: "Review and manage lost-person reports submitted during events.",
  },
  "/dashboard/volunteer-user": {
    title: "Volunteer management",
    description: "Assign areas, approve volunteers, and coordinate volunteer operations.",
  },
  "/dashboard/volunteers": {
    title: "Volunteers",
    description: "Directory and status of active volunteers.",
  },
  "/dashboard/volunteers-map": {
    title: "Volunteers map",
    description: "Map view of volunteer positions and coverage areas.",
  },
  "/dashboard/volunteer-area": {
    title: "Volunteer areas",
    description: "Define and edit geographic volunteer zones and assignments.",
  },
  "/dashboard/users-map": {
    title: "Users map",
    description: "Geographic view of app users and activity (where enabled).",
  },
  "/dashboard/feature-post": {
    title: "Feature post map",
    description: "Map view for featured posts and user-generated location content.",
  },
  "/dashboard/section-categories": {
    title: "Categories",
    description: "Manage content categories for the app and CMS.",
  },
  "/dashboard/add-event": {
    title: "Add event",
    description: "Create pilgrimage and festival events for the public calendar.",
  },
  "/dashboard/edit-event": {
    title: "Edit events",
    description: "Update or remove existing events and schedules.",
  },
  "/dashboard/section-features": {
    title: "Features",
    description: "Configure home-screen feature sections and highlighted content.",
  },
  "/dashboard/add-places": {
    title: "Add places",
    description: "Add new pilgrimage and heritage places to the directory.",
  },
  "/dashboard/add-places-ai": {
    title: "Add places with AI",
    description: "Draft place records with AI assistance while avoiding duplicates.",
  },
  "/dashboard/update-places": {
    title: "Update places",
    description: "Edit existing place details, coordinates, media, and metadata.",
  },
  "/dashboard/place-closures": {
    title: "Place closures",
    description:
      "Mark pilgrimage sites temporarily closed, set a clear visitor-facing reason, and reopen when appropriate. Syncs to the mobile app.",
  },
  "/dashboard/replace-place-images": {
    title: "Fix broken images",
    description:
      "Repair broken or missing image URLs for places, heritage hero images, events, home feature slides, and category icons.",
  },
  "/dashboard/heritage-stories": {
    title: "Heritage narratives",
    description: "Redirect to manage saved pilgrimage stories and facts (legacy URL).",
  },
  "/dashboard/heritage-narratives/add": {
    title: "Add heritage narrative",
    description: "Create a new place story: overview, main text, facts, hero image, and publish to the app.",
  },
  "/dashboard/heritage-narratives/manage": {
    title: "Update heritage narratives",
    description: "Browse all saved narratives by display order, filter drafts or published, and open the editor.",
  },
  "/dashboard/sos-alerts": {
    title: "SOS alerts",
    description: "Monitor emergency SOS signals, locations, and coordination with volunteers.",
  },
  "/dashboard/cctv-management": {
    title: "CCTV management",
    description: "Register cameras, RTSP streams, and monitor device status.",
  },
  "/dashboard/crowd-control": {
    title: "Crowd monitoring",
    description: "Live CCTV mosaic and crowd oversight for key locations.",
  },
  "/dashboard/live-analytics": {
    title: "Live analytics",
    description: "Real-time crowd analytics and AI-assisted density insights.",
  },
  "/dashboard/crowd-density": {
    title: "Crowd density",
    description: "Spatial and temporal crowd density analysis across monitored sites.",
  },
  "/dashboard/crowd-logs": {
    title: "Crowd logs",
    description: "Historical crowd logs and time-series views for audits and planning.",
  },
  "/dashboard/crowd-predictions": {
    title: "Crowd predictions",
    description: "Forecasting and trend analysis for expected crowd levels.",
  },

  "/admin": {
    title: "Admin welcome",
    description: "Trinetra admin entry: shortcuts to users, uploads, and settings.",
  },
  "/admin/settings": {
    title: "Settings",
    description: "Admin account and panel settings.",
  },
  "/admin/users": {
    title: "Users",
    description: "Manage users from the admin workspace.",
  },
  "/admin/upload": {
    title: "Video upload",
    description: "Upload videos from the admin workspace.",
  },

  /** Legacy / unused paths kept for bookmarks or old links */
  "/dashboard/reports": {
    title: "Reports",
    description: "Security and operational reports (if enabled).",
  },
  "/dashboard/section-event": {
    title: "Events",
    description: "Legacy events section — use Add event or Edit events from the sidebar.",
  },
};

const HERITAGE_EDIT_PREFIX = "/dashboard/heritage-narratives/edit/";

export const getRouteMetadata = (pathname: string): RouteMetadata => {
  if (routeMetadata[pathname]) {
    return routeMetadata[pathname];
  }

  if (pathname.startsWith(HERITAGE_EDIT_PREFIX)) {
    return {
      title: "Edit heritage narrative",
      description:
        "Edit this place’s heritage story: paragraphs, facts, hero image, display order, and publication to the mobile app.",
    };
  }

  return {
    title: "Page not found",
    description: "This URL is not part of Trinetra. Use the menu or go back to the home page.",
  };
};
