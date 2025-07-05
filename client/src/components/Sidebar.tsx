import { Link, useLocation } from "wouter";
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

const navigation = [
  { name: "대시보드", href: "/", icon: BarChart3 },
  { name: "내 포트폴리오", href: "/portfolio", icon: Briefcase },
  { name: "종목 분석", href: "/analysis", icon: ChartBar },
  { name: "날씨 상관관계", href: "/weather", icon: Cloud },
  { name: "공시정보", href: "/dart", icon: FileText },
  { name: "설정", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-card border-r border-border">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      "nav-link",
                      isActive ? "nav-link-active" : "nav-link-inactive"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex-shrink-0 p-4">
          <button
            onClick={handleLogout}
            className="nav-link nav-link-inactive w-full"
          >
            <LogOut className="w-5 h-5 mr-3" />
            로그아웃
          </button>
        </div>
      </div>
    </nav>
  );
}
