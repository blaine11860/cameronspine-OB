import { useLocation } from "wouter";
import { Home, Clock, MessageCircle, Activity, User, Users } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const { t } = useTranslation();

  const navigationItems = [
    { path: "/", icon: Home, labelKey: "home" as const },
    { path: "/symptoms", icon: Activity, labelKey: "symptomsNav" as const },
    { path: "/forum", icon: Users, labelKey: "forum" as const },
    { path: "/messages", icon: MessageCircle, labelKey: "messages" as const },
    { path: "/profile", icon: User, labelKey: "profile" as const },
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
                {t[item.labelKey]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}