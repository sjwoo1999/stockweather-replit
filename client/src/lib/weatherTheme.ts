// 날씨 메타포 기반 디자인 토큰 시스템

export const weatherTheme = {
  // 날씨별 색상 팔레트
  weather: {
    sunny: {
      primary: '#FFA500',
      secondary: '#FFE4B5',
      background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
      cardBg: 'linear-gradient(135deg, #FFF8DC 0%, #FFFAF0 100%)',
      textPrimary: '#8B4513',
      textSecondary: '#CD853F',
      iconColor: '#FF8C00',
      confidence: '#32CD32'
    },
    cloudy: {
      primary: '#696969',
      secondary: '#D3D3D3',
      background: 'linear-gradient(135deg, #696969 0%, #808080 100%)',
      cardBg: 'linear-gradient(135deg, #F5F5F5 0%, #FFFFFF 100%)',
      textPrimary: '#2F4F4F',
      textSecondary: '#708090',
      iconColor: '#778899',
      confidence: '#4682B4'
    },
    rainy: {
      primary: '#4169E1',
      secondary: '#87CEEB',
      background: 'linear-gradient(135deg, #4169E1 0%, #1E90FF 100%)',
      cardBg: 'linear-gradient(135deg, #E6F3FF 0%, #F0F8FF 100%)',
      textPrimary: '#191970',
      textSecondary: '#4682B4',
      iconColor: '#1E90FF',
      confidence: '#00BFFF'
    },
    stormy: {
      primary: '#8A2BE2',
      secondary: '#DDA0DD',
      background: 'linear-gradient(135deg, #8A2BE2 0%, #9932CC 100%)',
      cardBg: 'linear-gradient(135deg, #F8F0FF 0%, #FAF0E6 100%)',
      textPrimary: '#4B0082',
      textSecondary: '#663399',
      iconColor: '#9932CC',
      confidence: '#FF69B4'
    },
    snowy: {
      primary: '#87CEEB',
      secondary: '#F0F8FF',
      background: 'linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%)',
      cardBg: 'linear-gradient(135deg, #F0FFFF 0%, #FFFFFF 100%)',
      textPrimary: '#2F4F4F',
      textSecondary: '#5F9EA0',
      iconColor: '#87CEEB',
      confidence: '#20B2AA'
    },
    windy: {
      primary: '#20B2AA',
      secondary: '#AFEEEE',
      background: 'linear-gradient(135deg, #20B2AA 0%, #48D1CC 100%)',
      cardBg: 'linear-gradient(135deg, #E0FFFF 0%, #F0FFFF 100%)',
      textPrimary: '#008B8B',
      textSecondary: '#5F9EA0',
      iconColor: '#48D1CC',
      confidence: '#00CED1'
    },
    drizzle: {
      primary: '#6495ED',
      secondary: '#B0C4DE',
      background: 'linear-gradient(135deg, #6495ED 0%, #4682B4 100%)',
      cardBg: 'linear-gradient(135deg, #F0F8FF 0%, #E6F3FF 100%)',
      textPrimary: '#191970',
      textSecondary: '#4682B4',
      iconColor: '#4682B4',
      confidence: '#1E90FF'
    }
  },
  
  // 투자 신호별 색상
  signals: {
    buy: {
      primary: '#22C55E',
      secondary: '#86EFAC',
      background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
      glow: '0 0 20px rgba(34, 197, 94, 0.4)'
    },
    hold: {
      primary: '#F59E0B',
      secondary: '#FCD34D',
      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      glow: '0 0 20px rgba(245, 158, 11, 0.4)'
    },
    sell: {
      primary: '#EF4444',
      secondary: '#FCA5A5',
      background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      glow: '0 0 20px rgba(239, 68, 68, 0.4)'
    }
  },
  
  // 신뢰도별 색상
  confidence: {
    high: '#22C55E',    // 80% 이상
    medium: '#F59E0B',  // 60-79%
    low: '#EF4444'      // 60% 미만
  }
};

// 날씨 조건에 따른 테마 가져오기
export const getWeatherTheme = (weatherCondition: string) => {
  return weatherTheme.weather[weatherCondition as keyof typeof weatherTheme.weather] || weatherTheme.weather.cloudy;
};

// 신뢰도에 따른 색상 가져오기
export const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return weatherTheme.confidence.high;
  if (confidence >= 60) return weatherTheme.confidence.medium;
  return weatherTheme.confidence.low;
};

// 투자 신호에 따른 테마 가져오기
export const getSignalTheme = (signal: string) => {
  return weatherTheme.signals[signal as keyof typeof weatherTheme.signals] || weatherTheme.signals.hold;
};