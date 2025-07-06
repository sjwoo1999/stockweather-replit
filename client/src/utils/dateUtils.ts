/**
 * 클라이언트 측 날짜 처리 유틸리티
 * 서버에서 받은 날짜 데이터를 안전하게 표시하기 위한 함수들
 */

/**
 * 안전한 날짜 파싱 및 검증
 * @param dateValue 서버에서 받은 날짜 값
 * @returns 유효한 Date 객체 또는 null
 */
export function parseServerDate(dateValue: any): Date | null {
  if (!dateValue) return null;
  
  try {
    const date = new Date(dateValue);
    
    // 유효한 Date 객체인지 확인
    if (isNaN(date.getTime())) {
      return null;
    }
    
    // 합리적인 날짜 범위인지 확인 (1990 ~ 현재+2년)
    const currentYear = new Date().getFullYear();
    const year = date.getFullYear();
    
    if (year < 1990 || year > currentYear + 2) {
      return null;
    }
    
    return date;
  } catch (error) {
    return null;
  }
}

/**
 * 날짜를 한국어 형식으로 포맷
 * @param date Date 객체 또는 날짜 문자열
 * @returns 포맷된 날짜 문자열
 */
export function formatDate(date: Date | string | null): string {
  const parsedDate = parseServerDate(date);
  
  if (!parsedDate) {
    return '날짜 정보 없음';
  }
  
  return parsedDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * 상대적 시간 표시 (예: "2일 전")
 * @param date Date 객체 또는 날짜 문자열
 * @returns 상대적 시간 문자열
 */
export function formatRelativeTime(date: Date | string | null): string {
  const parsedDate = parseServerDate(date);
  
  if (!parsedDate) {
    return '날짜 정보 없음';
  }
  
  const now = new Date();
  const diffTime = now.getTime() - parsedDate.getTime();
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
 * 날짜와 상대적 시간을 함께 표시
 * @param date Date 객체 또는 날짜 문자열
 * @returns "YYYY.MM.DD (X일 전)" 형식 문자열
 */
export function formatDateWithRelative(date: Date | string | null): string {
  const parsedDate = parseServerDate(date);
  
  if (!parsedDate) {
    return '날짜 정보 없음';
  }
  
  const formattedDate = formatDate(parsedDate);
  const relativeTime = formatRelativeTime(parsedDate);
  
  if (formattedDate === '날짜 정보 없음') {
    return '날짜 정보 없음';
  }
  
  return `${formattedDate} (${relativeTime})`;
}

/**
 * 날짜 유효성 검사
 * @param date 검사할 날짜
 * @returns 유효한 날짜인지 여부
 */
export function isValidDate(date: Date | string | null): boolean {
  return parseServerDate(date) !== null;
}

/**
 * 최근 날짜인지 확인 (30일 이내)
 * @param date 확인할 날짜
 * @returns 최근 날짜인지 여부
 */
export function isRecentDate(date: Date | string | null): boolean {
  const parsedDate = parseServerDate(date);
  
  if (!parsedDate) return false;
  
  const now = new Date();
  const diffTime = now.getTime() - parsedDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 30 && diffDays >= 0;
}

/**
 * 날짜 범위 내에 있는지 확인
 * @param date 확인할 날짜
 * @param startDate 시작 날짜
 * @param endDate 종료 날짜
 * @returns 범위 내에 있는지 여부
 */
export function isDateInRange(
  date: Date | string | null, 
  startDate: Date | string | null, 
  endDate: Date | string | null
): boolean {
  const parsedDate = parseServerDate(date);
  const parsedStartDate = parseServerDate(startDate);
  const parsedEndDate = parseServerDate(endDate);
  
  if (!parsedDate || !parsedStartDate || !parsedEndDate) {
    return false;
  }
  
  return parsedDate >= parsedStartDate && parsedDate <= parsedEndDate;
}

/**
 * 날짜 비교 (정렬용)
 * @param dateA 첫 번째 날짜
 * @param dateB 두 번째 날짜
 * @returns 비교 결과 (-1, 0, 1)
 */
export function compareDates(
  dateA: Date | string | null, 
  dateB: Date | string | null
): number {
  const parsedDateA = parseServerDate(dateA);
  const parsedDateB = parseServerDate(dateB);
  
  // null 값 처리
  if (!parsedDateA && !parsedDateB) return 0;
  if (!parsedDateA) return 1; // null은 나중으로
  if (!parsedDateB) return -1; // null은 나중으로
  
  return parsedDateB.getTime() - parsedDateA.getTime(); // 최신순
}