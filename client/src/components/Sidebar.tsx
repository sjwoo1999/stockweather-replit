import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { useNavigation } from "@/contexts/NavigationContext";
import { getNavigationIcon } from "@/constants/navigation";

export default function Sidebar() {
  const { navigationItems, isActive } = useNavigation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav 
      className="hidden md:flex md:flex-shrink-0"
      role="navigation"
      aria-label="주요 네비게이션"
    >
      <div className="flex flex-col w-64 bg-card border-r border-border">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="px-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = getNavigationIcon(item.icon);
              const active = isActive(item.href);
              
              return (
                <Link 
                  key={item.id} 
                  href={item.href}
                  className={cn(
                    "nav-link",
                    active ? "nav-link-active" : "nav-link-inactive"
                  )}
                  // 접근성 속성들
                  aria-current={active ? "page" : undefined}
                  aria-label={item.ariaLabel}
                  title={item.description}
                  // 키보드 네비게이션 지원
                  tabIndex={0}
                >
                  <Icon 
                    className="w-5 h-5 mr-3" 
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="flex-shrink-0 p-4">
          <button
            onClick={handleLogout}
            className="nav-link nav-link-inactive w-full"
            aria-label="계정에서 로그아웃"
            title="계정에서 로그아웃"
            tabIndex={0}
          >
            <LogOut 
              className="w-5 h-5 mr-3" 
              aria-hidden="true"
            />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </nav>
  );
}