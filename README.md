# StockWeather 📈🌤️

> 복잡한 주식 시장 정보를 직관적인 날씨 메타포로 시각화하는 혁신적인 투자 분석 플랫폼

## 🌟 프로젝트 소개

StockWeather는 한국 주식 시장의 복잡한 데이터를 일반인도 쉽게 이해할 수 있는 **날씨 예보 스타일**로 변환하여 제공하는 웹 애플리케이션입니다. 

### 핵심 컨셉
- **시장 날씨**: 전체 시장 동향을 날씨로 표현 (맑음, 흐림, 비, 폭풍)
- **종목별 날씨 예보**: 개별 주식의 전망을 날씨 아이콘과 함께 직관적으로 제공
- **상관관계 분석**: 실제 날씨와 주식 시장 간의 데이터 상관관계 분석

## 🚀 주요 기능

### 📊 대시보드
- **포트폴리오 관리**: 개인 주식 보유 현황 추적
- **실시간 시장 날씨**: 현재 시장 상황을 한눈에 파악
- **성과 차트**: 포트폴리오 수익률 시각화

### 🎯 투자 분석
- **종목별 날씨 예보**: 개별 주식의 향후 전망
- **날씨-주식 상관관계**: 기상 조건과 주식 성과의 연관성 분석
- **DART 공시 정보**: 기업 공시 자료 자동 수집 및 분석

### 🔔 알림 시스템
- **가격 알림**: 목표 가격 도달 시 알림
- **날씨 기반 알림**: 날씨 변화에 따른 투자 신호
- **공시 알림**: 보유 종목의 중요 공시 발표 시 알림

## 🛠️ 기술 스택

### Frontend
- **React 18** + **TypeScript**: 현대적인 프론트엔드 개발
- **Tailwind CSS** + **Radix UI**: 일관된 디자인 시스템
- **TanStack Query**: 효율적인 서버 상태 관리
- **Wouter**: 가벼운 라우팅 솔루션
- **React Hook Form** + **Zod**: 폼 관리 및 유효성 검사

### Backend
- **Node.js** + **Express**: 서버 사이드 애플리케이션
- **PostgreSQL** + **Drizzle ORM**: 데이터베이스 관리
- **Replit Auth**: 간편한 사용자 인증
- **REST API**: 표준화된 API 설계

### External APIs
- **Naver Finance API**: 한국 주식 데이터
- **OpenWeatherMap API**: 날씨 정보
- **DART API**: 기업 공시 데이터

## 🎨 디자인 시스템

### 날씨 메타포 매핑
```
주식 상태 → 날씨 표현
상승세 → ☀️ 맑음
보합 → ⛅ 흐림
하락세 → 🌧️ 비
급락 → ⛈️ 폭풍
횡보 → 🌫️ 안개
```

### 반응형 디자인
- **모바일 우선**: 스마트폰에서 최적화된 사용자 경험
- **적응형 레이아웃**: 데스크톱, 태블릿, 모바일 완벽 지원
- **다크 모드**: 눈의 피로를 줄이는 다크 테마

## 📋 프로젝트 구조

```
├── client/                 # 프론트엔드 애플리케이션
│   ├── src/
│   │   ├── components/     # 재사용 가능한 UI 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── hooks/          # 커스텀 React 훅
│   │   ├── lib/            # 유틸리티 함수
│   │   └── types/          # TypeScript 타입 정의
├── server/                 # 백엔드 애플리케이션
│   ├── services/           # 외부 API 통합
│   ├── routes.ts           # API 라우트 정의
│   ├── storage.ts          # 데이터베이스 작업
│   └── db.ts              # 데이터베이스 연결
├── shared/                 # 공유 타입 및 스키마
│   └── schema.ts          # 데이터베이스 스키마
```

## 🚀 시작하기

### 환경 요구사항
- Node.js 18+ 
- PostgreSQL 데이터베이스
- 외부 API 키 (OpenWeatherMap, DART)

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/sjwoo1999/stockweather-replit.git
cd stockweather-replit
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
# .env 파일 생성
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
OPENWEATHER_API_KEY=your_openweather_api_key
DART_API_KEY=your_dart_api_key
```

4. **데이터베이스 마이그레이션**
```bash
npm run db:push
```

5. **개발 서버 시작**
```bash
npm run dev
```

## 📊 데이터베이스 스키마

### 주요 테이블
- **users**: 사용자 정보 (Replit Auth 연동)
- **portfolios**: 사용자 포트폴리오
- **stock_holdings**: 주식 보유 현황
- **stock_prices**: 주식 가격 이력
- **weather_data**: 날씨 정보
- **weather_correlations**: 날씨-주식 상관관계
- **dart_disclosures**: DART 공시 정보
- **user_alerts**: 사용자 알림 설정

## 🔐 보안 및 인증

- **Replit Auth**: OpenID Connect 기반 안전한 인증
- **PostgreSQL Session Store**: 서버 사이드 세션 관리
- **환경 변수**: 민감한 정보 보호
- **HTTPS**: 모든 통신 암호화

## 🎯 주요 특징

### 1. 직관적인 시각화
복잡한 주식 데이터를 누구나 이해할 수 있는 날씨 메타포로 변환

### 2. 실시간 데이터
한국 주식 시장의 실시간 데이터를 지속적으로 업데이트

### 3. 개인화된 경험
사용자별 포트폴리오와 맞춤형 알림 시스템

### 4. 상관관계 분석
실제 날씨와 주식 시장 간의 데이터 기반 상관관계 제공

## 📈 향후 계획

- [ ] 머신러닝 기반 예측 모델 고도화
- [ ] 소셜 트레이딩 기능 추가
- [ ] 모바일 앱 개발
- [ ] 해외 주식 시장 지원 확장
- [ ] AI 기반 투자 추천 시스템

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📧 문의

프로젝트 관련 문의사항이 있으시면 [GitHub Issues](https://github.com/sjwoo1999/stockweather-replit/issues)를 통해 연락주세요.

---

**StockWeather** - 주식 투자를 날씨처럼 쉽게 만드는 혁신적인 플랫폼 🌤️📈