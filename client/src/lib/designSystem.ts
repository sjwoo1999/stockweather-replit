// StockWeather 통합 디자인 시스템

export const designSystem = {
  // 1. 시장 날씨 (전체 시장 상황) - 차분한 그레이/블루 톤
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

  // 2. 주식 날씨 예보 (개별 종목) - 생동감 있는 날씨별 색상
  stockWeather: {
    sunny: {
      cardBg: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
      primary: '#f59e0b',
      secondary: '#f97316',
      textPrimary: '#92400e',
      textSecondary: '#a16207',
      accent: '#f59e0b',
      glow: '0 0 20px rgba(245, 158, 11, 0.3)'
    },
    cloudy: {
      cardBg: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
      primary: '#64748b',
      secondary: '#475569',
      textPrimary: '#334155',
      textSecondary: '#475569',
      accent: '#64748b',
      glow: '0 0 20px rgba(100, 116, 139, 0.3)'
    },
    rainy: {
      cardBg: 'linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%)',
      primary: '#3b82f6',
      secondary: '#1d4ed8',
      textPrimary: '#1e40af',
      textSecondary: '#1e3a8a',
      accent: '#3b82f6',
      glow: '0 0 20px rgba(59, 130, 246, 0.3)'
    },
    stormy: {
      cardBg: 'linear-gradient(135deg, #fce7f3 0%, #a855f7 100%)',
      primary: '#a855f7',
      secondary: '#7c3aed',
      textPrimary: '#6b21a8',
      textSecondary: '#581c87',
      accent: '#a855f7',
      glow: '0 0 20px rgba(168, 85, 247, 0.3)'
    },
    snowy: {
      cardBg: 'linear-gradient(135deg, #f0f9ff 0%, #0ea5e9 100%)',
      primary: '#0ea5e9',
      secondary: '#0284c7',
      textPrimary: '#0369a1',
      textSecondary: '#0c4a6e',
      accent: '#0ea5e9',
      glow: '0 0 20px rgba(14, 165, 233, 0.3)'
    },
    windy: {
      cardBg: 'linear-gradient(135deg, #ecfdf5 0%, #10b981 100%)',
      primary: '#10b981',
      secondary: '#059669',
      textPrimary: '#047857',
      textSecondary: '#065f46',
      accent: '#10b981',
      glow: '0 0 20px rgba(16, 185, 129, 0.3)'
    },
    drizzle: {
      cardBg: 'linear-gradient(135deg, #f0f9ff 0%, #38bdf8 100%)',
      primary: '#38bdf8',
      secondary: '#0284c7',
      textPrimary: '#0369a1',
      textSecondary: '#0c4a6e',
      accent: '#38bdf8',
      glow: '0 0 20px rgba(56, 189, 248, 0.3)'
    }
  },

  // 3. 투자 신호 색상 (매수/보유/매도)
  signals: {
    buy: {
      background: 'linear-gradient(135deg, #dcfce7 0%, #16a34a 100%)',
      color: '#ffffff',
      glow: '0 0 15px rgba(22, 163, 74, 0.4)',
      icon: '#ffffff'
    },
    hold: {
      background: 'linear-gradient(135deg, #fef3c7 0%, #eab308 100%)',
      color: '#ffffff',
      glow: '0 0 15px rgba(234, 179, 8, 0.4)',
      icon: '#ffffff'
    },
    sell: {
      background: 'linear-gradient(135deg, #fecaca 0%, #dc2626 100%)',
      color: '#ffffff',
      glow: '0 0 15px rgba(220, 38, 38, 0.4)',
      icon: '#ffffff'
    }
  },

  // 4. 전역 디자인 토큰
  tokens: {
    borderRadius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem'
    },
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem'
    },
    typography: {
      heading: {
        fontWeight: '700',
        letterSpacing: '-0.025em'
      },
      body: {
        fontWeight: '400',
        letterSpacing: '0'
      },
      caption: {
        fontWeight: '500',
        letterSpacing: '0.025em'
      }
    },
    shadows: {
      subtle: '0 1px 3px rgba(0, 0, 0, 0.1)',
      moderate: '0 4px 12px rgba(0, 0, 0, 0.1)',
      strong: '0 8px 25px rgba(0, 0, 0, 0.15)',
      glow: '0 0 20px rgba(0, 0, 0, 0.1)'
    }
  }
};

// 헬퍼 함수들
export const getMarketWeatherTheme = () => designSystem.marketWeather;

export const getStockWeatherTheme = (condition: string) => {
  const themes = designSystem.stockWeather;
  return themes[condition as keyof typeof themes] || themes.cloudy;
};

export const getSignalTheme = (signal: string) => {
  const signals = designSystem.signals;
  return signals[signal as keyof typeof signals] || signals.hold;
};

export const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return '#16a34a'; // 높은 신뢰도 - 녹색
  if (confidence >= 60) return '#eab308'; // 보통 신뢰도 - 노란색
  if (confidence >= 40) return '#f97316'; // 낮은 신뢰도 - 주황색
  return '#dc2626'; // 매우 낮은 신뢰도 - 빨간색
};

// 애니메이션 프리셋
export const animations = {
  fadeIn: 'animate-in fade-in duration-500',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-500',
  scaleIn: 'animate-in zoom-in-95 duration-300',
  hover: 'transition-all duration-300 hover:scale-105',
  glow: 'animate-pulse',
  bounce: 'animate-bounce'
};

// 레이아웃 프리셋
export const layouts = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  grid: {
    responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    market: 'grid grid-cols-1 lg:grid-cols-3 gap-8',
    metrics: 'grid grid-cols-2 gap-6'
  },
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between'
};