import { createContext, useContext, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { 
  NAVIGATION_ITEMS, 
  NavigationItem, 
  isActiveRoute, 
  findNavigationItem 
} from '@/constants/navigation';

// 네비게이션 컨텍스트 타입 정의
interface NavigationContextType {
  // 네비게이션 데이터
  navigationItems: NavigationItem[];
  currentPath: string;
  
  // 상태 확인 함수들
  isActive: (href: string) => boolean;
  getCurrentItem: () => NavigationItem | undefined;
  
  // 페이지 정보 함수들
  getPageTitle: () => string;
  getPageDescription: () => string;
  getBreadcrumb: () => NavigationItem[];
}

// 컨텍스트 생성
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Provider Props 타입
interface NavigationProviderProps {
  children: ReactNode;
}

// 네비게이션 Provider 컴포넌트
export function NavigationProvider({ children }: NavigationProviderProps) {
  const [currentPath] = useLocation();

  // 현재 활성 경로 확인
  const isActive = (href: string): boolean => {
    return isActiveRoute(currentPath, href);
  };

  // 현재 네비게이션 아이템 가져오기
  const getCurrentItem = (): NavigationItem | undefined => {
    return findNavigationItem(currentPath);
  };

  // 페이지 제목 가져오기
  const getPageTitle = (): string => {
    const currentItem = getCurrentItem();
    return currentItem?.name || "StockWeather";
  };

  // 페이지 설명 가져오기
  const getPageDescription = (): string => {
    const currentItem = getCurrentItem();
    return currentItem?.description || "주식 날씨 예보 서비스";
  };

  // 브레드크럼 생성 (현재는 단일 레벨, 추후 확장 가능)
  const getBreadcrumb = (): NavigationItem[] => {
    const currentItem = getCurrentItem();
    if (!currentItem) return [];
    
    // 홈이 아닌 경우 홈 -> 현재 페이지 순서
    if (currentItem.href !== "/") {
      const homeItem = NAVIGATION_ITEMS.find(item => item.href === "/");
      return homeItem ? [homeItem, currentItem] : [currentItem];
    }
    
    return [currentItem];
  };

  // 컨텍스트 값 객체
  const contextValue: NavigationContextType = {
    navigationItems: NAVIGATION_ITEMS,
    currentPath,
    isActive,
    getCurrentItem,
    getPageTitle,
    getPageDescription,
    getBreadcrumb,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

// 네비게이션 컨텍스트 사용 훅
export function useNavigationContext(): NavigationContextType {
  const context = useContext(NavigationContext);
  
  if (context === undefined) {
    throw new Error(
      'useNavigationContext는 NavigationProvider 내부에서만 사용할 수 있습니다.'
    );
  }
  
  return context;
}

// 편의 훅들 (기존 useNavigation 훅과 호환성 유지)
export function useNavigation() {
  return useNavigationContext();
}