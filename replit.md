# StockWeather - 주식 날씨 상관관계 분석 플랫폼

## Overview

StockWeather는 복잡한 주식 시장 정보를 직관적인 날씨 예보 스타일 메타포로 단순화하여 개인 투자자들이 시장 동향과 투자 신호를 한눈에 파악할 수 있도록 도와주는 웹 애플리케이션입니다. 실제 날씨 데이터가 아닌 주식 전망을 날씨 형태로 시각화하여 투자 결정을 쉽게 만들어줍니다.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI + Tailwind CSS (shadcn/ui)
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter (lightweight routing)
- **Form Management**: React Hook Form + Zod validation
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS with CSS variables for theming

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon (serverless PostgreSQL)
- **Authentication**: Replit Auth (OIDC-based)
- **Session Management**: express-session with PostgreSQL store
- **API Design**: RESTful APIs with standardized error handling

### Project Structure
```
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── types/          # TypeScript type definitions
├── server/                 # Backend application
│   ├── services/           # External API integrations
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   └── db.ts              # Database connection
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema definitions
└── migrations/            # Database migrations
```

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC
- **Session Management**: PostgreSQL-backed sessions
- **User Management**: Automatic user creation/update on login
- **Authorization**: Route-level protection with middleware

### Database Schema
- **Users**: Basic profile information from Replit Auth
- **Portfolios**: User-created investment portfolios
- **Stock Holdings**: Individual stock positions with confidence levels
- **Stock Master**: Complete Korean stock market database (95+ companies)
- **Stock Prices**: Historical and real-time price data
- **Weather Data**: Weather metrics for correlation analysis
- **Weather Correlations**: Calculated correlations between weather and stock performance
- **DART Disclosures**: Korean corporate disclosure information
- **User Alerts**: Customizable notifications for price/weather/disclosure events
- **Portfolio Performance**: Historical performance tracking

### External API Integrations
- **Stock Data**: Naver Finance API for Korean stock market data
- **Weather Data**: OpenWeatherMap API for weather information
- **DART API**: Korean Financial Supervisory Service for corporate disclosures
- **Fallback Systems**: Mock data generators for development and API failures

### UI Components
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Component Library**: Comprehensive set of reusable components
- **Data Visualization**: Interactive charts for portfolio and correlation analysis
- **Form Management**: Consistent form handling with validation
- **Notification System**: Toast notifications for user feedback

## Data Flow

### User Authentication Flow
1. User accesses protected route
2. Replit Auth middleware validates session
3. User redirected to login if unauthenticated
4. Successful login creates/updates user record
5. Session established with PostgreSQL store

### Portfolio Management Flow
1. User creates portfolio with basic information
2. Stock holdings added with shares, price, and confidence level
3. Real-time price updates fetched from external APIs
4. Performance calculations generated and cached
5. Charts and metrics displayed in dashboard

### Weather Correlation Analysis
1. Weather data collected from external APIs
2. Stock price movements tracked over time
3. Statistical correlations calculated between weather factors and stock performance
4. Results cached and displayed in correlation views
5. Insights used for investment recommendations

### DART Disclosure Integration
1. Recent disclosures fetched from DART API
2. Disclosure data parsed and categorized
3. Stock-specific disclosures linked to user holdings
4. Notifications generated for relevant disclosures
5. Disclosure summaries displayed in dashboard

## External Dependencies

### Production Dependencies
- **Database**: @neondatabase/serverless, drizzle-orm
- **Authentication**: passport, openid-client
- **UI Framework**: @radix-ui/*, @tanstack/react-query
- **API Integrations**: axios, xml2js
- **Session Management**: express-session, connect-pg-simple
- **Validation**: zod, @hookform/resolvers
- **Charts**: recharts
- **Styling**: tailwindcss, clsx

### Development Dependencies
- **Build Tools**: vite, tsx, esbuild
- **Type Checking**: typescript, @types/*
- **Database**: drizzle-kit for migrations
- **Replit Integration**: @replit/vite-plugin-*

## Deployment Strategy

### Development Environment
- **Platform**: Replit with live development server
- **Database**: Neon PostgreSQL database
- **Hot Reload**: Vite HMR for frontend, tsx for backend
- **Environment Variables**: Managed through Replit secrets

### Production Build
- **Frontend**: Vite build with optimizations
- **Backend**: ESBuild bundling for Node.js
- **Database**: Drizzle migrations for schema updates
- **Static Assets**: Served through Express static middleware

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Session encryption key
- **REPLIT_DOMAINS**: Authentication domain configuration
- **API Keys**: External service credentials (weather, DART)

## Changelog

```
Changelog:
- July 06, 2025. Socket 기반 실시간 검색 시스템 구축 완료 - WebSocket 연동, 400 에러 해결, UX 획기적 향상
- July 06, 2025. DART API 완전 전환 완료 - 시세 혼동 해결, 95개 종목 확대, 사용자 신뢰성 강화
- July 06, 2025. 시장 날씨 DART API 실시간 연동 완성 - 95개 종목 기반 AI 시장 분석 시스템 구축
- July 06, 2025. 한국 증시 검색 시스템 대폭 개선 - 95개 종목 확장, 다중 검색 패턴 지원
- July 06, 2025. PC 네비게이션 문제 해결 - 클릭 이벤트 처리 개선, CSS 스타일 간섭 제거
- July 05, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```