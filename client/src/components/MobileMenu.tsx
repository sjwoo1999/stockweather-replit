import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Briefcase, 
  ChartBar, 
  Cloud, 
  FileText, 
  Settings,
  LogOut,
  X
} from "lucide-react";

const navigation = [
  { name: "대시보드", href: "/", icon: BarChart3 },
  { name: "내 포트폴리오", href: "/portfolio", icon: Briefcase },
  { name: "종목 분석", href: "/analysis", icon: ChartBar },
  { name: "날씨 상관관계", href: "/weather", icon: Cloud },
  { name: "공시정보", href: "/dart", icon: FileText },
  { name: "설정", href: "/settings", icon: Settings },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-card shadow-xl">
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">메뉴</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "block px-4 py-2 text-sm font-medium",
                    isActive 
                      ? "text-primary bg-primary/10 border-r-4 border-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3 inline" />
                  {item.name}
                </a>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <LogOut className="w-5 h-5 mr-3 inline" />
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
