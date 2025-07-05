import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Briefcase, 
  ChartBar, 
  Cloud, 
  FileText, 
  Settings,
  LogOut
} from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";

// 아이콘 매핑
const iconMap = {
  Cloud,
  Briefcase,
  ChartBar,
  BarChart3,
  FileText,
  Settings,
};

export default function Sidebar() {
  const { navigationItems, isActive } = useNavigation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-card border-r border-border">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="px-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap];
              const active = isActive(item.href);
              
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={cn(
                    "nav-link",
                    active ? "nav-link-active" : "nav-link-inactive"
                  )}
                  // 네비게이션 접근성 향상
                  aria-current={active ? "page" : undefined}
                  title={item.description}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex-shrink-0 p-4">
          <button
            onClick={handleLogout}
            className="nav-link nav-link-inactive w-full"
            title="계정에서 로그아웃"
          >
            <LogOut className="w-5 h-5 mr-3" />
            로그아웃
          </button>
        </div>
      </div>
    </nav>
  );
}