import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Layers,
  LayoutDashboard,
  LogOut,
  Map,
  MapPin,
  MapPinned,
  UserCheck,
  UserCircle,
  UserCog,
  UserSearch,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useRef, useState } from "react";

import { auth } from "@/firebase/firebase";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import { signOut } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";

const navSections = [
  {
    heading: "Main",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Users", path: "/dashboard/users", icon: Users },
      { name: "Features", path: "/dashboard/section-features", icon: Layers },
      // { name: "Categories", path: "/dashboard/section-categories", icon: Layers },
      { name: "Add Places", path: "/dashboard/add-places", icon: MapPin },
      { name: "Update Places", path: "/dashboard/update-places", icon: MapPinned },
      { name: "Add Event", path: "/dashboard/add-event", icon: Calendar },
      { name: "Edit Event", path: "/dashboard/edit-event", icon: Calendar },
      { name: "Lost People", path: "/dashboard/lost-people", icon: UserSearch },
      // { name: "Feature Post", path: "/dashboard/feature-post", icon: Newspaper },
      { name: "User's Map", path: "/dashboard/users-map", icon: Globe2 },
      { name: "SOS Alerts", path: "/dashboard/sos-alerts", icon: AlertCircle },
    ],
  },
  {
    heading: "Volunteer",
    items: [
      {
        name: "Volunteer Management",
        path: "/dashboard/volunteer-user",
        icon: UserCog,
      },
      { name: "Volunteer's", path: "/dashboard/volunteers", icon: UserCheck },
      { name: "Maps View", path: "/dashboard/volunteers-map", icon: Map },
      {
        name: "Volunteer Area",
        path: "/dashboard/volunteer-area",
        icon: MapPinned,
      },
    ],
  },
  {
    heading: "CCTV Monitoring",
    items: [
      {
        name: "Crowd Monitoring",
        path: "/dashboard/crowd-control",
        icon: UserCog,
      },
      { name: "Crowd Density", path: "/dashboard/volunteers", icon: UserCheck },
      { name: "Crowd Logs", path: "/dashboard/volunteers-map", icon: Map },
      {
        name: "Crowd Prediction",
        path: "/dashboard/volunteer-area",
        icon: MapPinned,
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {/* Logo */}
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <img
                src="/assets/logo.png"
                alt="logo"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900">Trinetra</span>
            </div>
          ) : (
            <div />
          )}

          {/* Modern Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200",
              "bg-gray-900 hover:bg-black text-white shadow-lg hover:shadow-xl transform hover:scale-105",
              "border border-gray-300"
            )}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div
          className={cn(
            "flex-1 overflow-y-auto space-y-6",
            collapsed ? "p-2" : "p-4"
          )}
        >
          {navSections.map((section) => (
            <div key={section.heading}>
              {!collapsed && (
                <h4 className="text-xs text-gray-500 font-semibold uppercase mb-2 tracking-wide px-2">
                  {section.heading}
                </h4>
              )}
              <div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <div className="relative group" key={item.path}>
                      <Link
                        to={item.path}
                        onMouseEnter={(e) => handleMouseEnter(item.name, e)}
                        onMouseLeave={handleMouseLeave}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                          "hover:bg-gray-100 hover:text-gray-900",
                          "hover:shadow-sm hover:scale-[1.02]",
                          isActive &&
                            "bg-gray-900 text-white font-semibold shadow-sm",
                          collapsed ? "justify-center" : ""
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-5 h-5 transition-colors duration-200",
                            isActive
                              ? "text-white"
                              : "text-gray-600 group-hover:text-gray-900"
                          )}
                        />
                        {!collapsed && <span>{item.name}</span>}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: User info + logout */}
        <div
          className={cn(
            "p-4 border-t border-gray-200 flex items-center gap-3 transition-all",
            collapsed && "justify-center p-2"
          )}
        >
          <UserCircle className="text-gray-500 w-6 h-6" />
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {user?.email || "User"}
              </p>
              <p className="text-xs text-gray-500 capitalize">Role: user</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-600 hover:text-gray-900 transition-colors duration-200" />
          </button>
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
