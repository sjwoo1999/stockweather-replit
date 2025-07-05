import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { 
  NAVIGATION_ITEMS, 
  getNavigationIcon, 
  isActiveRoute 
} from "@/constants/navigation";
import { LogOut, X } from "lucide-react";
import type { User } from "@shared/schema";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user } = useAuth() as { user: User | undefined };
  const [currentPath] = useLocation();

  // ESC 키로 메뉴 닫기
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="모바일 메뉴"
    >
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* 메뉴 패널 */}
      <div 
        className="fixed inset-y-0 left-0 max-w-xs w-full bg-card shadow-xl"
        onKeyDown={handleKeyDown}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">메뉴</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-1"
            aria-label="메뉴 닫기"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        
        {/* 네비게이션 메뉴 */}
        <nav 
          className="flex-1 px-2 py-4 space-y-2"
          role="navigation"
          aria-label="모바일 네비게이션"
        >
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = getNavigationIcon(item.icon);
            const active = isActiveRoute(currentPath, item.href);
            
            return (
              <Link 
                key={item.id} 
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                  active 
                    ? "text-primary bg-primary/10 border-r-4 border-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                onClick={onClose}
                // 접근성 속성들
                aria-current={active ? "page" : undefined}
                aria-label={item.ariaLabel}
                title={item.description}
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
        </nav>
        
        {/* 사용자 정보 및 로그아웃 */}
        {user && (
          <div className="border-t border-border p-4">
            {/* 사용자 프로필 */}
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-medium">
                  {user.firstName?.[0] || user.email?.[0] || 'U'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-foreground">
                  {user.firstName || user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            
            {/* 로그아웃 버튼 */}
            <button
              onClick={() => window.location.href = "/api/logout"}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="계정에서 로그아웃"
              tabIndex={0}
            >
              <LogOut 
                className="w-5 h-5 mr-3" 
                aria-hidden="true"
              />
              <span>로그아웃</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}