import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNavigation } from "@/hooks/useNavigation";
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

// 아이콘 매핑
const iconMap = {
  Cloud,
  Briefcase,
  ChartBar,
  BarChart3,
  FileText,
  Settings,
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user } = useAuth();
  const { navigationItems, isActive } = useNavigation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-card shadow-xl">
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">메뉴</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const active = isActive(item.href);
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  active 
                    ? "text-primary bg-primary/10 border-r-4 border-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                title={item.description}
              >
                <Icon className="w-5 h-5 mr-3 inline" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        {user && (
          <div className="border-t border-border p-4">
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
            
            <button
              onClick={() => window.location.href = "/api/logout"}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              로그아웃
            </button>
          </div>
        )}
      </div>
    </div>
  );
}