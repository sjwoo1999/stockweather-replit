import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { 
  NAVIGATION_ITEMS, 
  getNavigationIcon, 
  isActiveRoute 
} from "@/constants/navigation";

export default function Sidebar() {
  const [currentPath, setLocation] = useLocation();

  const handleNavigation = (href: string) => {
    console.log('Sidebar navigation clicked:', href);
    try {
      setLocation(href);
      console.log('Navigation successful to:', href);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

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
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = getNavigationIcon(item.icon);
              const active = isActiveRoute(currentPath, item.href);
              
              return (
                <button
                  key={item.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Button clicked for:', item.name);
                    handleNavigation(item.href);
                  }}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-full text-left cursor-pointer hover:scale-[1.02]",
                    active 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  // 접근성 속성들
                  aria-current={active ? "page" : undefined}
                  aria-label={item.ariaLabel}
                  title={item.description}
                  // 키보드 네비게이션 지원
                  tabIndex={0}
                  type="button"
                >
                  <Icon 
                    className="w-5 h-5 mr-3" 
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex-shrink-0 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-full text-left text-muted-foreground hover:text-foreground hover:bg-muted"
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