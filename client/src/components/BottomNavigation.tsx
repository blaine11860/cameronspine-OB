import { useLocation } from "wouter";
import { Home, Clock, MessageCircle, Activity, User } from "lucide-react";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navigationItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/symptoms", icon: Activity, label: "Symptoms" },
    { path: "/messages", icon: MessageCircle, label: "Messages" },
    { path: "/timeline", icon: Clock, label: "Timeline" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
                isActive ? "text-rose-deep" : "text-gray-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className={`text-xs ${isActive ? "font-medium" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}