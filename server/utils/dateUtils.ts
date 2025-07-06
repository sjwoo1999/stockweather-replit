/**
 * DART API 날짜 처리 유틸리티
 * DART API는 날짜를 "YYYYMMDD" 형식 문자열로 반환하므로 정확한 파싱이 필요
 */

export interface DateParseResult {
  date: Date | null;
  isValid: boolean;
  originalValue: any;
  errorMessage?: string;
}

/**
 * DART API의 날짜 문자열을 정확히 파싱
 * @param dateStr DART API의 날짜 문자열 (예: "20241225")
 * @returns 파싱된 Date 객체 또는 null
 */
export function parseDartDate(dateStr: any): DateParseResult {
  // 입력값 검증
  if (!dateStr || dateStr === null || dateStr === undefined) {
    return {
      date: null,
      isValid: false,
      originalValue: dateStr,
      errorMessage: '날짜 데이터가 없습니다'
    };
  }

  const dateString = String(dateStr).trim();
  
  // DART API 표준 형식: YYYYMMDD (8자리)
  if (/^\d{8}$/.test(dateString)) {
    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(4, 6)) - 1; // JavaScript Date는 0부터 시작
    const day = parseInt(dateString.substring(6, 8));
    
    // 유효한 날짜인지 검증
    if (year >= 1990 && year <= new Date().getFullYear() + 10 && 
        month >= 0 && month <= 11 && 
        day >= 1 && day <= 31) {
      
      const parsedDate = new Date(year, month, day);
      
      // Date 객체가 실제로 유효한 날짜인지 재검증
      if (parsedDate.getFullYear() === year && 
          parsedDate.getMonth() === month && 
          parsedDate.getDate() === day) {
        return {
          date: parsedDate,
          isValid: true,
          originalValue: dateStr
        };
      }
    }
  }
  
  // ISO 형식 또는 다른 형식 시도
  try {
    const attemptedDate = new Date(dateString);
    if (!isNaN(attemptedDate.getTime()) && attemptedDate.getFullYear() >= 1990) {
      return {
        date: attemptedDate,
        isValid: true,
        originalValue: dateStr
      };
    }
  } catch (error) {
    // Date 생성 실패
  }

  // 숫자로만 구성된 다른 형식들 처리
  if (/^\d+$/.test(dateString)) {
    // Unix timestamp (밀리초)
    if (dateString.length === 13) {
      const timestamp = parseInt(dateString);
      const date = new Date(timestamp);
      if (!isNaN(date.getTime()) && date.getFullYear() >= 1990) {
        return {
          date,
          isValid: true,
          originalValue: dateStr
        };
      }
    }
    
    // Unix timestamp (초)
    if (dateString.length === 10) {
      const timestamp = parseInt(dateString) * 1000;
      const date = new Date(timestamp);
      if (!isNaN(date.getTime()) && date.getFullYear() >= 1990) {
        return {
          date,
          isValid: true,
          originalValue: dateStr
        };
      }
    }
  }

  return {
    date: null,
    isValid: false,
    originalValue: dateStr,
    errorMessage: `잘못된 날짜 형식: ${dateString}`
  };
}

/**
 * 날짜를 한국어 형식으로 포맷
 * @param date Date 객체
 * @returns 포맷된 날짜 문자열
 */
export function formatDateToKorean(date: Date | null): string {
  if (!date || isNaN(date.getTime())) {
    return '날짜 정보 없음';
  }
  
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * 날짜를 상대적 시간으로 표시 (예: "2일 전")
 * @param date Date 객체
 * @returns 상대적 시간 문자열
 */
export function formatRelativeDate(date: Date | null): string {
  if (!date || isNaN(date.getTime())) {
    return '날짜 정보 없음';
  }
  
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '오늘';
  } else if (diffDays === 1) {
    return '어제';
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}주 전`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}개월 전`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years}년 전`;
  }
}

/**
 * 날짜 범위 검증 (최근 5년 이내의 공시만 유효)
 * @param date Date 객체
 * @returns 유효한 날짜인지 여부
 */
export function isValidDisclosureDate(date: Date | null): boolean {
  if (!date || isNaN(date.getTime())) {
    return false;
  }
  
  const now = new Date();
  const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  
  return date >= fiveYearsAgo && date <= oneYearFromNow;
}

/**
 * 날짜 파싱 로그 (디버깅용)
 * @param originalValue 원본 값
 * @param result 파싱 결과
 */
export function logDateParsing(originalValue: any, result: DateParseResult): void {
  if (!result.isValid) {
    console.warn(`[날짜 파싱 실패] 원본: ${originalValue}, 오류: ${result.errorMessage}`);
  } else {
    console.log(`[날짜 파싱 성공] 원본: ${originalValue}, 결과: ${result.date?.toISOString()}`);
  }
}