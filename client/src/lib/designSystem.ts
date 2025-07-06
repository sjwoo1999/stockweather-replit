// StockWeather 통합 디자인 시스템 - 날씨 메타포 기반 투자 시각 언어

// 타입 정의 및 상수
export const WEATHER_CONDITIONS = {
  SUNNY: 'sunny',
  CLOUDY: 'cloudy', 
  RAINY: 'rainy',
  STORMY: 'stormy',
  SNOWY: 'snowy',
  WINDY: 'windy',
  DRIZZLE: 'drizzle'
} as const;

export const INVESTMENT_SIGNALS = {
  BUY: 'buy',
  HOLD: 'hold', 
  SELL: 'sell'
} as const;

export const CONFIDENCE_LEVELS = {
  HIGH: 'high',    // 80% 이상
  MEDIUM: 'medium', // 60-79%
  LOW: 'low'       // 60% 미만
} as const;

export type WeatherCondition = typeof WEATHER_CONDITIONS[keyof typeof WEATHER_CONDITIONS];
export type InvestmentSignal = typeof INVESTMENT_SIGNALS[keyof typeof INVESTMENT_SIGNALS];
export type ConfidenceLevel = typeof CONFIDENCE_LEVELS[keyof typeof CONFIDENCE_LEVELS];

// 테마 인터페이스 정의
interface WeatherTheme {
  primary: string;
  secondary: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  glow: string;
  iconColor: string;
  confidence: string;
}

interface SignalTheme {
  background: string;
  color: string;
  glow: string;
  icon: string;
  border: string;
}

export const designSystem = {
  // 1. 시장 날씨 테마 - 전체 시장 상황 (차분한 그레이/블루 톤)
  marketWeather: {
    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    cardBg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    textPrimary: '#ffffff',
    textSecondary: '#e1e7ef',
    accent: '#60a5fa',
    border: 'rgba(255, 255, 255, 0.2)',
    shadow: '0 8px 32px rgba(30, 58, 138, 0.3)',
    iconColor: '#ffffff',
    badgeStyle: {
      background: 'rgba(255, 255, 255, 0.2)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    }
  },

  // 2. 날씨별 테마 통합 - 개별 종목 날씨 예보 (생동감 있는 색상)
  weather: {
    [WEATHER_CONDITIONS.SUNNY]: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
      cardBg: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
      textPrimary: '#92400e',
      textSecondary: '#a16207',
      accent: '#f59e0b',
      glow: '0 0 20px rgba(245, 158, 11, 0.4)',
      iconColor: '#f97316',
      confidence: '#16a34a'
    },
    [WEATHER_CONDITIONS.CLOUDY]: {
      primary: '#64748b',
      secondary: '#94a3b8',
      cardBg: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
      textPrimary: '#334155',
      textSecondary: '#475569',
      accent: '#64748b',
      glow: '0 0 20px rgba(100, 116, 139, 0.3)',
      iconColor: '#475569',
      confidence: '#64748b'
    },
    [WEATHER_CONDITIONS.RAINY]: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      cardBg: 'linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%)',
      textPrimary: '#1e40af',
      textSecondary: '#1e3a8a',
      accent: '#3b82f6',
      glow: '0 0 20px rgba(59, 130, 246, 0.4)',
      iconColor: '#1d4ed8',
      confidence: '#1e90ff'
    },
    [WEATHER_CONDITIONS.STORMY]: {
      primary: '#a855f7',
      secondary: '#c084fc',
      cardBg: 'linear-gradient(135deg, #fce7f3 0%, #a855f7 100%)',
      textPrimary: '#6b21a8',
      textSecondary: '#581c87',
      accent: '#a855f7',
      glow: '0 0 20px rgba(168, 85, 247, 0.4)',
      iconColor: '#7c3aed',
      confidence: '#ff69b4'
    },
    [WEATHER_CONDITIONS.SNOWY]: {
      primary: '#0ea5e9',
      secondary: '#38bdf8',
      cardBg: 'linear-gradient(135deg, #f0f9ff 0%, #0ea5e9 100%)',
      textPrimary: '#0369a1',
      textSecondary: '#0c4a6e',
      accent: '#0ea5e9',
      glow: '0 0 20px rgba(14, 165, 233, 0.4)',
      iconColor: '#0284c7',
      confidence: '#20b2aa'
    },
    [WEATHER_CONDITIONS.WINDY]: {
      primary: '#10b981',
      secondary: '#34d399',
      cardBg: 'linear-gradient(135deg, #ecfdf5 0%, #10b981 100%)',
      textPrimary: '#047857',
      textSecondary: '#065f46',
      accent: '#10b981',
      glow: '0 0 20px rgba(16, 185, 129, 0.4)',
      iconColor: '#059669',
      confidence: '#00ced1'
    },
    [WEATHER_CONDITIONS.DRIZZLE]: {
      primary: '#38bdf8',
      secondary: '#7dd3fc',
      cardBg: 'linear-gradient(135deg, #f0f9ff 0%, #38bdf8 100%)',
      textPrimary: '#0369a1',
      textSecondary: '#0c4a6e',
      accent: '#38bdf8',
      glow: '0 0 20px rgba(56, 189, 248, 0.4)',
      iconColor: '#0284c7',
      confidence: '#1e90ff'
    }
  } satisfies Record<WeatherCondition, WeatherTheme>,

  // 3. 투자 신호 테마 - 강화된 글로우 및 그라데이션
  signals: {
    [INVESTMENT_SIGNALS.BUY]: {
      background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
      color: '#ffffff',
      glow: '0 0 20px rgba(22, 163, 74, 0.5)',
      icon: '#ffffff',
      border: '1px solid rgba(22, 163, 74, 0.3)'
    },
    [INVESTMENT_SIGNALS.HOLD]: {
      background: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
      color: '#ffffff',
      glow: '0 0 20px rgba(234, 179, 8, 0.5)',
      icon: '#ffffff',
      border: '1px solid rgba(234, 179, 8, 0.3)'
    },
    [INVESTMENT_SIGNALS.SELL]: {
      background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      color: '#ffffff',
      glow: '0 0 20px rgba(220, 38, 38, 0.5)',
      icon: '#ffffff',
      border: '1px solid rgba(220, 38, 38, 0.3)'
    }
  } satisfies Record<InvestmentSignal, SignalTheme>,

  // 레거시 호환성을 위한 alias (기존 컴포넌트 지원)
  stockWeather: {
    [WEATHER_CONDITIONS.SUNNY]: {
      cardBg: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
      primary: '#f59e0b',
      secondary: '#f97316',
      textPrimary: '#92400e',
      textSecondary: '#a16207',
      accent: '#f59e0b',
      glow: '0 0 20px rgba(245, 158, 11, 0.3)'
    },
    [WEATHER_CONDITIONS.CLOUDY]: {
      cardBg: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
      primary: '#64748b',
      secondary: '#475569',
      textPrimary: '#334155',
      textSecondary: '#475569',
      accent: '#64748b',
      glow: '0 0 20px rgba(100, 116, 139, 0.3)'
    },
    [WEATHER_CONDITIONS.RAINY]: {
      cardBg: 'linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%)',
      primary: '#3b82f6',
      secondary: '#1d4ed8',
      textPrimary: '#1e40af',
      textSecondary: '#1e3a8a',
      accent: '#3b82f6',
      glow: '0 0 20px rgba(59, 130, 246, 0.3)'
    },
    [WEATHER_CONDITIONS.STORMY]: {
      cardBg: 'linear-gradient(135deg, #fce7f3 0%, #a855f7 100%)',
      primary: '#a855f7',
      secondary: '#7c3aed',
      textPrimary: '#6b21a8',
      textSecondary: '#581c87',
      accent: '#a855f7',
      glow: '0 0 20px rgba(168, 85, 247, 0.3)'
    },
    [WEATHER_CONDITIONS.SNOWY]: {
      cardBg: 'linear-gradient(135deg, #f0f9ff 0%, #0ea5e9 100%)',
      primary: '#0ea5e9',
      secondary: '#0284c7',
      textPrimary: '#0369a1',
      textSecondary: '#0c4a6e',
      accent: '#0ea5e9',
      glow: '0 0 20px rgba(14, 165, 233, 0.3)'
    },
    [WEATHER_CONDITIONS.WINDY]: {
      cardBg: 'linear-gradient(135deg, #ecfdf5 0%, #10b981 100%)',
      primary: '#10b981',
      secondary: '#059669',
      textPrimary: '#047857',
      textSecondary: '#065f46',
      accent: '#10b981',
      glow: '0 0 20px rgba(16, 185, 129, 0.3)'
    },
    [WEATHER_CONDITIONS.DRIZZLE]: {
      cardBg: 'linear-gradient(135deg, #f0f9ff 0%, #38bdf8 100%)',
      primary: '#38bdf8',
      secondary: '#0284c7',
      textPrimary: '#0369a1',
      textSecondary: '#0c4a6e',
      accent: '#38bdf8',
      glow: '0 0 20px rgba(56, 189, 248, 0.3)'
    }
  },

  // 4. 확장된 디자인 토큰 시스템
  tokens: {
    // 색상 토큰
    color: {
      // 신뢰도별 색상
      confidence: {
        [CONFIDENCE_LEVELS.HIGH]: '#16a34a',    // 80% 이상 - 진한 녹색
        [CONFIDENCE_LEVELS.MEDIUM]: '#eab308',  // 60-79% - 황금색
        [CONFIDENCE_LEVELS.LOW]: '#dc2626'      // 60% 미만 - 빨간색
      },
      // 기본 브랜드 색상
      brand: {
        primary: '#3b82f6',
        secondary: '#1e40af',
        accent: '#60a5fa',
        neutral: '#64748b'
      },
      // 상태별 색상
      status: {
        success: '#16a34a',
        warning: '#eab308',
        error: '#dc2626',
        info: '#3b82f6'
      }
    },
    
    // 경계선 둥글기
    borderRadius: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      full: '9999px'
    },
    
    // 간격 시스템
    spacing: {
      xxs: '0.25rem',
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
      xxl: '4rem'
    },
    
    // 타이포그래피 시스템
    typography: {
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      weight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800'
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75'
      },
      letterSpacing: {
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em'
      }
    },
    
    // 그림자 시스템
    shadows: {
      none: 'none',
      subtle: '0 1px 3px rgba(0, 0, 0, 0.1)',
      moderate: '0 4px 12px rgba(0, 0, 0, 0.1)',
      strong: '0 8px 25px rgba(0, 0, 0, 0.15)',
      glow: '0 0 20px rgba(0, 0, 0, 0.1)',
      weather: '0 8px 32px rgba(0, 0, 0, 0.12)',
      signal: '0 4px 20px rgba(0, 0, 0, 0.15)'
    },
    
    // 애니메이션 토큰
    animation: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
        slower: '1000ms'
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      keyframes: {
        fadeIn: 'animate-in fade-in duration-500',
        slideUp: 'animate-in slide-in-from-bottom-4 duration-500',
        scaleIn: 'animate-in zoom-in-95 duration-300',
        pulse: 'animate-pulse',
        bounce: 'animate-bounce',
        glow: 'animate-pulse duration-2000'
      }
    },
    
    // Z-인덱스 시스템
    zIndex: {
      base: 0,
      raised: 10,
      dropdown: 1000,
      sticky: 1010,
      overlay: 1020,
      modal: 1030,
      tooltip: 1040
    }
  },

  // 5. 확장된 레이아웃 시스템
  layout: {
    // 컨테이너 프리셋
    container: {
      base: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      narrow: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
      wide: 'max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8',
      full: 'w-full px-4 sm:px-6 lg:px-8'
    },
    
    // 그리드 시스템
    grid: {
      responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
      market: 'grid grid-cols-1 lg:grid-cols-3 gap-8',
      metrics: 'grid grid-cols-2 md:grid-cols-4 gap-6',
      dashboard: 'grid grid-cols-1 lg:grid-cols-4 gap-6',
      cards: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
    },
    
    // 플렉스 시스템
    flex: {
      center: 'flex items-center justify-center',
      between: 'flex items-center justify-between',
      start: 'flex items-center justify-start',
      end: 'flex items-center justify-end',
      col: 'flex flex-col',
      colCenter: 'flex flex-col items-center justify-center',
      wrap: 'flex flex-wrap'
    },
    
    // 반응형 스택
    stack: {
      vertical: 'flex flex-col space-y-4',
      horizontal: 'flex flex-row space-x-4',
      responsive: 'flex flex-col md:flex-row md:space-x-4 md:space-y-0 space-y-4'
    }
  }
};

// ===== 통합 헬퍼 함수 시스템 =====

// 1. 테마 헬퍼 함수들
export const theme = {
  // 시장 날씨 테마 가져오기
  getMarketWeather: () => designSystem.marketWeather,
  
  // 개별 종목 날씨 테마 가져오기 (타입 안전)
  getWeather: (condition: WeatherCondition) => {
    return designSystem.weather[condition] || designSystem.weather[WEATHER_CONDITIONS.CLOUDY];
  },
  
  // 레거시 지원 (기존 코드 호환성)
  getStockWeather: (condition: string) => {
    const validCondition = condition as WeatherCondition;
    return designSystem.stockWeather[validCondition] || designSystem.stockWeather[WEATHER_CONDITIONS.CLOUDY];
  },
  
  // 투자 신호 테마 가져오기
  getSignal: (signal: InvestmentSignal) => {
    return designSystem.signals[signal] || designSystem.signals[INVESTMENT_SIGNALS.HOLD];
  },
  
  // 신뢰도별 색상 가져오기
  getConfidenceColor: (confidence: number): string => {
    if (confidence >= 80) return designSystem.tokens.color.confidence[CONFIDENCE_LEVELS.HIGH];
    if (confidence >= 60) return designSystem.tokens.color.confidence[CONFIDENCE_LEVELS.MEDIUM];
    return designSystem.tokens.color.confidence[CONFIDENCE_LEVELS.LOW];
  },
  
  // 신뢰도 레벨 가져오기
  getConfidenceLevel: (confidence: number): ConfidenceLevel => {
    if (confidence >= 80) return CONFIDENCE_LEVELS.HIGH;
    if (confidence >= 60) return CONFIDENCE_LEVELS.MEDIUM;
    return CONFIDENCE_LEVELS.LOW;
  }
};

// 2. 애니메이션 헬퍼 함수들
export const animations = {
  // 기본 애니메이션
  fadeIn: designSystem.tokens.animation.keyframes.fadeIn,
  slideUp: designSystem.tokens.animation.keyframes.slideUp,
  scaleIn: designSystem.tokens.animation.keyframes.scaleIn,
  pulse: designSystem.tokens.animation.keyframes.pulse,
  bounce: designSystem.tokens.animation.keyframes.bounce,
  glow: designSystem.tokens.animation.keyframes.glow,
  
  // 인터랙션 애니메이션
  hover: `transition-all ${designSystem.tokens.animation.duration.normal} ${designSystem.tokens.animation.easing.easeInOut} hover:scale-105`,
  press: `transition-all ${designSystem.tokens.animation.duration.fast} ${designSystem.tokens.animation.easing.easeInOut} active:scale-95`,
  
  // 커스텀 애니메이션 생성
  custom: (duration: keyof typeof designSystem.tokens.animation.duration, easing: keyof typeof designSystem.tokens.animation.easing) => 
    `transition-all ${designSystem.tokens.animation.duration[duration]} ${designSystem.tokens.animation.easing[easing]}`
};

// 3. 레이아웃 헬퍼 함수들
export const layouts = {
  // 컨테이너
  container: (size: keyof typeof designSystem.layout.container = 'base') => 
    designSystem.layout.container[size],
  
  // 그리드
  grid: (type: keyof typeof designSystem.layout.grid = 'responsive') => 
    designSystem.layout.grid[type],
  
  // 플렉스
  flex: (type: keyof typeof designSystem.layout.flex = 'center') => 
    designSystem.layout.flex[type],
  
  // 스택
  stack: (direction: keyof typeof designSystem.layout.stack = 'vertical') => 
    designSystem.layout.stack[direction]
};

// 4. 유틸리티 헬퍼 함수들
export const utils = {
  // 날씨 조건 유효성 검사
  isValidWeatherCondition: (condition: string): condition is WeatherCondition => {
    return Object.values(WEATHER_CONDITIONS).includes(condition as WeatherCondition);
  },
  
  // 투자 신호 유효성 검사
  isValidInvestmentSignal: (signal: string): signal is InvestmentSignal => {
    return Object.values(INVESTMENT_SIGNALS).includes(signal as InvestmentSignal);
  },
  
  // 신뢰도 범위 검사
  isValidConfidence: (confidence: number): boolean => {
    return confidence >= 0 && confidence <= 100;
  },
  
  // 날씨 아이콘 매핑
  getWeatherIcon: (condition: WeatherCondition): string => {
    const iconMap = {
      [WEATHER_CONDITIONS.SUNNY]: '☀️',
      [WEATHER_CONDITIONS.CLOUDY]: '⛅',
      [WEATHER_CONDITIONS.RAINY]: '🌧️',
      [WEATHER_CONDITIONS.STORMY]: '⛈️',
      [WEATHER_CONDITIONS.SNOWY]: '❄️',
      [WEATHER_CONDITIONS.WINDY]: '💨',
      [WEATHER_CONDITIONS.DRIZZLE]: '🌦️'
    };
    return iconMap[condition] || iconMap[WEATHER_CONDITIONS.CLOUDY];
  },
  
  // 투자 신호 아이콘 매핑
  getSignalIcon: (signal: InvestmentSignal): string => {
    const iconMap = {
      [INVESTMENT_SIGNALS.BUY]: '📈',
      [INVESTMENT_SIGNALS.HOLD]: '⏸️',
      [INVESTMENT_SIGNALS.SELL]: '📉'
    };
    return iconMap[signal] || iconMap[INVESTMENT_SIGNALS.HOLD];
  }
};

// 레거시 호환성을 위한 기존 함수들 (deprecated, 새 코드에서는 theme.* 사용 권장)
export const getMarketWeatherTheme = () => theme.getMarketWeather();
export const getStockWeatherTheme = (condition: string) => theme.getStockWeather(condition);
export const getSignalTheme = (signal: string) => theme.getSignal(signal as InvestmentSignal);
export const getConfidenceColor = (confidence: number) => theme.getConfidenceColor(confidence);