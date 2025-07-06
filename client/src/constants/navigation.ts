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

// 메뉴 그룹 정의
export interface MenuGroup {
  id: string;
  name: string;
  description: string;
  items: NavigationItem[];
}

// 네비게이션 메뉴 데이터 (데이터 흐름 기반 재구성)
export const NAVIGATION_ITEMS: NavigationItem[] = [
  // 1️⃣ 분석 정보 (데이터 수집 → 분석)
  {
    id: "dart",
    name: "기업 공시",
    href: "/dart",
    icon: "FileText",
    description: "DART 기업 공시 정보 및 최신 동향",
    ariaLabel: "기업 공시 정보 페이지로 이동"
  },
  {
    id: "analysis",
    name: "종목 분석",
    href: "/analysis",
    icon: "ChartBar",
    description: "개별 종목 차트 및 기술적 분석",
    ariaLabel: "종목 분석 페이지로 이동"
  },
  
  // 2️⃣ 날씨 예보 (분석 → 예측)
  {
    id: "dashboard",
    name: "종목별 날씨",
    href: "/",
    icon: "Cloud",
    description: "개별 종목을 날씨로 표현한 직관적 예보",
    ariaLabel: "종목별 날씨 예보 대시보드로 이동"
  },
  {
    id: "weather",
    name: "시장 날씨",
    href: "/weather",
    icon: "BarChart3",
    description: "전체 시장 동향과 날씨 상관관계 분석",
    ariaLabel: "시장 날씨 분석 페이지로 이동"
  },
  
  // 3️⃣ 개인화 (예측 → 투자 관리)
  {
    id: "portfolio",
    name: "내 포트폴리오",
    href: "/portfolio",
    icon: "Briefcase",
    description: "개인 투자 포트폴리오 관리 및 성과 분석",
    ariaLabel: "포트폴리오 관리 페이지로 이동"
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

// 메뉴 그룹화 (UI 표시용)
export const MENU_GROUPS: MenuGroup[] = [
  {
    id: "analysis",
    name: "📊 정보 분석",
    description: "기업 공시부터 종목 분석까지",
    items: NAVIGATION_ITEMS.slice(0, 2) // 기업 공시, 종목 분석
  },
  {
    id: "forecast", 
    name: "🌤️ 날씨 예보",
    description: "종목별·시장별 날씨 예보",
    items: NAVIGATION_ITEMS.slice(2, 4) // 종목별 날씨, 시장 날씨
  },
  {
    id: "personal",
    name: "👤 개인 관리", 
    description: "포트폴리오 및 설정",
    items: NAVIGATION_ITEMS.slice(4, 6) // 내 포트폴리오, 설정
  }
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