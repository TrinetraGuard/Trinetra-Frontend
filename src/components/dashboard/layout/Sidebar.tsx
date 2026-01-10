import {
  Activity,
  AlertCircle,
  BarChart3,
  Brain,
  Calendar,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileText,
  Globe2,
  Layers,
  LayoutDashboard,
  LogOut,
  Map,
  MapPin,
  MapPinned,
  TrendingUp,
  UserCheck,
  UserCircle,
  UserCog,
  UserSearch,
  Users,
  Video,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useRef, useState } from "react";

import { auth } from "@/firebase/firebase";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import { signOut } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSubsection {
  name: string;
  items: NavItem[];
}

interface NavSection {
  heading: string;
  subsections: NavSubsection[];
}

const navSections: NavSection[] = [
  {
    heading: "Main",
    subsections: [
      {
        name: "Dashboard & Users",
        items: [
          { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { name: "Users", path: "/dashboard/users", icon: Users },
        ],
      },
      {
        name: "Content Management",
        items: [
          { name: "Features", path: "/dashboard/section-features", icon: Layers },
          { name: "Add Event", path: "/dashboard/add-event", icon: Calendar },
          { name: "Edit Event", path: "/dashboard/edit-event", icon: Calendar },
        ],
      },
      {
        name: "Places Management",
        items: [
          { name: "Add Places", path: "/dashboard/add-places", icon: MapPin },
          { name: "Update Places", path: "/dashboard/update-places", icon: MapPinned },
        ],
      },
      {
        name: "Lost & Found",
        items: [
          { name: "Lost People", path: "/dashboard/lost-people", icon: UserSearch },
          { name: "User's Map", path: "/dashboard/users-map", icon: Globe2 },
        ],
      },
      {
        name: "Emergency",
        items: [
          { name: "SOS Alerts", path: "/dashboard/sos-alerts", icon: AlertCircle },
        ],
      },
    ],
  },
  {
    heading: "Volunteer",
    subsections: [
      {
        name: "Management",
        items: [
          {
            name: "Volunteer Management",
            path: "/dashboard/volunteer-user",
            icon: UserCog,
          },
          { name: "Volunteers", path: "/dashboard/volunteers", icon: UserCheck },
        ],
      },
      {
        name: "Monitoring",
        items: [
          { name: "Maps View", path: "/dashboard/volunteers-map", icon: Map },
          {
            name: "Volunteer Area",
            path: "/dashboard/volunteer-area",
            icon: MapPinned,
          },
        ],
      },
    ],
  },
  {
    heading: "CCTV Monitoring",
    subsections: [
      {
        name: "Real-time Monitoring",
        items: [
          {
            name: "CCTV Management",
            path: "/dashboard/cctv-management",
            icon: Camera,
          },
          {
            name: "Crowd Monitoring",
            path: "/dashboard/crowd-control",
            icon: Video,
          },
          {
            name: "Live Analytics",
            path: "/dashboard/crowd-control",
            icon: Activity,
          },
        ],
      },
      {
        name: "Analytics & Reports",
        items: [
          {
            name: "Crowd Density",
            path: "/dashboard/crowd-control",
            icon: BarChart3,
          },
          {
            name: "Crowd Logs",
            path: "/dashboard/crowd-control",
            icon: FileText,
          },
          {
            name: "Crowd Prediction",
            path: "/dashboard/crowd-control",
            icon: Brain,
          },
          {
            name: "Trends & Insights",
            path: "/dashboard/crowd-control",
            icon: TrendingUp,
          },
        ],
      },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [expandedSubsections, setExpandedSubsections] = useState<Set<string>>(
    new Set(navSections.flatMap((section) => 
      section.subsections.map((sub) => `${section.heading}-${sub.name}`)
    ))
  );
  const sidebarRef = useRef<HTMLElement>(null);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleMouseEnter = (itemName: string, event: React.MouseEvent) => {
    if (collapsed) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({ x: rect.right + 8, y: rect.top + rect.height / 2 });
      setHoveredItem(itemName);
    }
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const toggleSubsection = (sectionHeading: string, subsectionName: string) => {
    const key = `${sectionHeading}-${subsectionName}`;
    setExpandedSubsections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const isSubsectionExpanded = (sectionHeading: string, subsectionName: string) => {
    return expandedSubsections.has(`${sectionHeading}-${subsectionName}`);
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col justify-between relative",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Top: Logo + Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
          {/* Logo */}
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="/assets/logo.png"
                  alt="logo"
                  className="w-9 h-9 rounded-lg shadow-sm"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 to-transparent rounded-lg"></div>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900 block leading-tight">Trinetra</span>
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Admin Panel</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <img
                src="/assets/logo.png"
                alt="logo"
                className="w-8 h-8 rounded-lg shadow-sm"
              />
            </div>
          )}

          {/* Modern Toggle Button */}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200",
                "bg-gray-900 hover:bg-black text-white shadow-md hover:shadow-lg transform hover:scale-105",
                "border border-gray-800"
              )}
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200",
                "bg-gray-900 hover:bg-black text-white shadow-md hover:shadow-lg transform hover:scale-105",
                "border border-gray-800 mt-2"
              )}
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div
          className={cn(
            "flex-1 overflow-y-auto",
            collapsed ? "p-2" : "p-4"
          )}
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="space-y-6">
            {navSections.map((section) => (
              <div key={section.heading} className="space-y-3">
                {!collapsed && (
                  <h4 className="text-xs text-gray-500 font-bold uppercase mb-3 tracking-wider px-2 flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    <span className="text-gray-600">{section.heading}</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  </h4>
                )}
                <div className="space-y-2">
                  {section.subsections.map((subsection) => {
                    const subsectionKey = `${section.heading}-${subsection.name}`;
                    const isExpanded = isSubsectionExpanded(
                      section.heading,
                      subsection.name
                    );

                    return (
                      <div key={subsectionKey} className="space-y-1">
                        {!collapsed && (
                          <button
                            onClick={() =>
                              toggleSubsection(section.heading, subsection.name)
                            }
                            className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all duration-200 group"
                          >
                            <span className="uppercase tracking-wider">
                              {subsection.name}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-700 transition-transform" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-700 transition-transform" />
                            )}
                          </button>
                        )}
                        {(!collapsed && isExpanded) || collapsed ? (
                          <div className={cn("space-y-0.5", collapsed && "space-y-1")}>
                            {subsection.items.map((item) => {
                              const Icon = item.icon;
                              const isActive = location.pathname === item.path;
                              return (
                                <div
                                  className="relative group"
                                  key={item.path}
                                >
                                  <Link
                                    to={item.path}
                                    onMouseEnter={(e) =>
                                      handleMouseEnter(item.name, e)
                                    }
                                    onMouseLeave={handleMouseLeave}
                                    className={cn(
                                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                                      "hover:bg-gray-100 hover:text-gray-900",
                                      "hover:shadow-sm hover:translate-x-0.5",
                                      isActive &&
                                        "bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold shadow-md",
                                      collapsed ? "justify-center" : "",
                                      !collapsed && "ml-2"
                                    )}
                                  >
                                    <Icon
                                      className={cn(
                                        "w-4 h-4 transition-colors duration-200 flex-shrink-0",
                                        isActive
                                          ? "text-white"
                                          : "text-gray-600 group-hover:text-gray-900"
                                      )}
                                    />
                                    {!collapsed && (
                                      <span className="truncate">{item.name}</span>
                                    )}
                                    {isActive && !collapsed && (
                                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>
                                    )}
                                  </Link>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: User info + logout */}
        <div
          className={cn(
            "p-4 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 transition-all",
            collapsed && "p-2"
          )}
        >
          <div className={cn(
            "flex items-center gap-3",
            collapsed && "justify-center"
          )}>
            <div className="relative">
              <div className="absolute inset-0 bg-gray-900 rounded-full opacity-10"></div>
              <UserCircle className="text-gray-600 w-7 h-7 relative" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.email?.split("@")[0] || "User"}
                </p>
                <p className="text-xs text-gray-500 capitalize truncate">
                  Admin
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-110 hover:shadow-sm group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors duration-200" />
            </button>
          </div>
        </div>
      </aside>

      {/* Portal Tooltip */}
      {collapsed &&
        hoveredItem &&
        createPortal(
          <div
            className="fixed pointer-events-none z-[999999]"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: "translateY(-50%)",
            }}
          >
            <div className="relative whitespace-nowrap bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-2xl">
              {hoveredItem}
              {/* Tooltip arrow */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export { Sidebar };
