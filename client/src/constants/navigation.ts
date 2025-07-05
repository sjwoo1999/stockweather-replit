import { 
  BarChart3, 
  Briefcase, 
  ChartBar, 
  Cloud, 
  FileText, 
  Settings,
  LucideIcon
} from "lucide-react";

// 네비게이션 아이콘 타입 정의
export type NavigationIconType = 
  | "Cloud" 
  | "Briefcase" 
  | "ChartBar" 
  | "BarChart3" 
  | "FileText" 
  | "Settings";

// 아이콘 매핑 (타입 안전성 보장)
export const NAVIGATION_ICONS: Record<NavigationIconType, LucideIcon> = {
  Cloud,
  Briefcase,
  ChartBar,
  BarChart3,
  FileText,
  Settings,
} as const;

// 네비게이션 아이템 타입 정의
export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: NavigationIconType;
  description: string;
  ariaLabel: string;
}

// 네비게이션 메뉴 데이터 (중앙 집중식)
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "dashboard",
    name: "주식 날씨 예보",
    href: "/",
    icon: "Cloud",
    description: "주식 시장을 날씨처럼 직관적으로 파악",
    ariaLabel: "주식 날씨 예보 대시보드로 이동"
  },
  {
    id: "portfolio",
    name: "내 포트폴리오",
    href: "/portfolio",
    icon: "Briefcase",
    description: "개인 투자 포트폴리오 관리",
    ariaLabel: "포트폴리오 관리 페이지로 이동"
  },
  {
    id: "analysis",
    name: "종목 분석",
    href: "/analysis",
    icon: "ChartBar",
    description: "상세한 개별 종목 분석",
    ariaLabel: "종목 분석 페이지로 이동"
  },
  {
    id: "weather",
    name: "시장 날씨",
    href: "/weather",
    icon: "BarChart3",
    description: "날씨와 주식 시장의 상관관계",
    ariaLabel: "시장 날씨 분석 페이지로 이동"
  },
  {
    id: "dart",
    name: "공시정보",
    href: "/dart",
    icon: "FileText",
    description: "DART 기업 공시 정보",
    ariaLabel: "기업 공시 정보 페이지로 이동"
  },
  {
    id: "settings",
    name: "설정",
    href: "/settings",
    icon: "Settings",
    description: "계정 및 앱 설정",
    ariaLabel: "설정 페이지로 이동"
  },
] as const;

// 네비게이션 헬퍼 함수들
export const getNavigationIcon = (iconType: NavigationIconType): LucideIcon => {
  return NAVIGATION_ICONS[iconType];
};

export const findNavigationItem = (href: string): NavigationItem | undefined => {
  // 정확히 일치하는 항목 먼저 찾기
  let found = NAVIGATION_ITEMS.find(item => item.href === href);
  if (found) return found;
  
  // 루트 경로가 아닌 경우, 시작 부분이 일치하는 항목 찾기
  if (href !== "/") {
    found = NAVIGATION_ITEMS.find(item => 
      item.href !== "/" && href.startsWith(item.href)
    );
  }
  
  return found;
};

export const isActiveRoute = (currentPath: string, itemHref: string): boolean => {
  // 루트 경로는 정확히 일치해야 함
  if (itemHref === "/") {
    return currentPath === "/";
  }
  
  // 다른 경로는 시작 부분이 일치하면 활성으로 간주
  return currentPath.startsWith(itemHref);
};