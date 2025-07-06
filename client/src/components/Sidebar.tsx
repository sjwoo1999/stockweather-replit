import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { 
  NAVIGATION_ITEMS, 
  getNavigationIcon
} from "@/constants/navigation";

export default function Sidebar() {
  const [currentPath, setLocation] = useLocation();
  const [activeNavItem, setActiveNavItem] = useState(currentPath);

  // 경로 변경 시 활성 아이템 동기화
  useEffect(() => {
    console.log(`[Sidebar] Path changed: ${currentPath}`);
    setActiveNavItem(currentPath);
  }, [currentPath]);

  const handleNavigation = (href: string) => {
    console.log(`[Sidebar] Navigation clicked: ${href}`);
    console.log(`[Sidebar] Current path: ${currentPath}`);
    
    try {
      // 즉시 UI 상태 업데이트
      setActiveNavItem(href);
      
      // 네비게이션 실행
      setLocation(href);
      
      console.log(`[Sidebar] Navigation completed to: ${href}`);
    } catch (error) {
      console.error(`[Sidebar] Navigation error:`, error);
    }
  };

  // 간단한 경로 매칭 함수
  const isActive = (itemHref: string) => {
    if (itemHref === '/') {
      return activeNavItem === '/';
    }
    return activeNavItem.startsWith(itemHref);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav 
      className="hidden md:flex md:flex-shrink-0 relative z-10"
      role="navigation"
      aria-label="주요 네비게이션"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex flex-col w-64 bg-card border-r border-border">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="px-4 space-y-1">
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = getNavigationIcon(item.icon);
              const active = isActive(item.href);
              
              return (
                <button
                  key={item.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`[Sidebar] Button clicked for: ${item.href}`);
                    handleNavigation(item.href);
                  }}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 w-full text-left cursor-pointer",
                    active 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  aria-current={active ? "page" : undefined}
                  aria-label={item.ariaLabel}
                  title={item.description}
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