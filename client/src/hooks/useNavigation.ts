import { useLocation } from "wouter";
import { useMemo } from "react";

// 네비게이션 아이템 정의
export const navigationItems = [
  { 
    name: "주식 날씨 예보", 
    href: "/", 
    icon: "Cloud",
    description: "주식 시장을 날씨처럼 직관적으로 파악"
  },
  { 
    name: "내 포트폴리오", 
    href: "/portfolio", 
    icon: "Briefcase",
    description: "개인 투자 포트폴리오 관리"
  },
  { 
    name: "종목 분석", 
    href: "/analysis", 
    icon: "ChartBar",
    description: "상세한 개별 종목 분석"
  },
  { 
    name: "시장 날씨", 
    href: "/weather", 
    icon: "BarChart3",
    description: "날씨와 주식 시장의 상관관계"
  },
  { 
    name: "공시정보", 
    href: "/dart", 
    icon: "FileText",
    description: "DART 기업 공시 정보"
  },
  { 
    name: "설정", 
    href: "/settings", 
    icon: "Settings",
    description: "계정 및 앱 설정"
  },
];

export function useNavigation() {
  const [location] = useLocation();

  // 현재 활성 경로 계산
  const activeRoute = useMemo(() => {
    return navigationItems.find(item => {
      // 정확한 경로 매칭
      if (item.href === "/" && location === "/") return true;
      if (item.href !== "/" && location.startsWith(item.href)) return true;
      return false;
    });
  }, [location]);

  // 각 네비게이션 아이템의 활성 상태 확인
  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  // 페이지 제목 가져오기
  const getPageTitle = () => {
    return activeRoute?.name || "StockWeather";
  };

  // 페이지 설명 가져오기
  const getPageDescription = () => {
    return activeRoute?.description || "주식 날씨 예보 서비스";
  };

  return {
    navigationItems,
    activeRoute,
    isActive,
    currentPath: location,
    getPageTitle,
    getPageDescription,
  };
}