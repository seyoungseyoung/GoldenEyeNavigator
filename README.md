# GoldenLife Navigator: 당신의 AI 금융 어드바이저

**GoldenLife Navigator**는 사용자의 투자 성향과 재무 목표에 맞춰, AI가 개인화된 투자 전략을 추천하고 시장 분석 및 안정적인 매매 타이밍 신호를 제공하는 차세대 금융 어드바이저 웹 애플리케이션입니다. 복잡한 금융 데이터를 AI가 분석하여, 누구나 쉽게 이해하고 실행할 수 있는 명확한 가이드를 제시하는 것을 목표로 합니다.

![GoldenLife Navigator Screenshot](https://placehold.co/800x450.png?text=GoldenLife+Navigator+UI)
*<p align="center">실제 애플리케이션 데모 UI (참고용 이미지)</p>*

---

## ✨ 주요 기능 상세 설명

### 1. 🤖 맞춤형 투자 전략 설문 (`/survey`)

사용자로부터 10가지 핵심 질문에 대한 답변을 받아, 이를 기반으로 **이중 AI 파이프라인**이 개인에게 최적화된 투자 포트폴리오를 생성합니다.

-   **10가지 핵심 질문**: 사용자는 은퇴 준비 기간, 목표 소득, 자산 규모, 위험 감수 수준, 선호 투자 테마 등 10가지 질문으로 구성된 설문에 답변합니다.
-   **AI 이중 검증 파이프라인**:
    1.  **생성 AI**: 사용자의 답변을 기반으로 투자 전략의 **초안**을 창의적으로 생성합니다.
    2.  **검수 AI**: 생성된 초안을 입력받아, "추천 종목은 3~4개여야 한다", "자산 배분의 합은 100이어야 한다"와 같은 **엄격한 비즈니스 규칙**에 맞게 최종적으로 편집하고 완성합니다. 이 구조는 결과물의 안정성과 신뢰도를 극대화합니다.
-   **안정적인 결과 확인**: 최종 전략이 `localStorage`에 저장된 후, 사용자는 결과 페이지(`/strategy`)로 안전하게 이동하며 "전략 생성 완료" 알림을 통해 일관된 경험을 제공받습니다.

### 2. 📊 내 전략 확인 (`/strategy`)

AI가 생성한 맞춤 전략을 다양한 시각 자료와 상세한 설명으로 명확하게 확인할 수 있는 개인 대시보드 페이지입니다.

-   **자산 배분 시각화**: 추천된 '주식', '채권', '현금' 비중을 보여주는 동적 파이 차트.
-   **AI 추천 종목**: AI가 사용자의 성향에 맞춰 선정한 3~4개의 추천 ETF 및 주식 종목과 **각 종목을 추천하는 구체적인 이유**를 명확하게 제시합니다.
-   **거래 전략 및 설명**: 포트폴리오 운용 방식에 대한 '거래 전략'과, AI가 이러한 전략을 추천하게 된 근거를 상세히 설명하는 '전략 설명'을 제공하여 투자 결정에 확신을 더합니다.
-   **AI Q&A**: 생성된 내 전략에 대해 궁금한 점을 AI에게 직접 질문하고 답변을 받을 수 있습니다.
-   **AI 시장 해설**: 사용자가 관심 있는 시장 뉴스 텍스트를 입력하면, AI가 '시장 요약', '제안 조치', '근거'로 나누어 깊이 있는 분석을 제공합니다.

### 3. ⏱️ AI 매매 타이밍 분석 (`/timing`)

안정성과 정확성을 극대화하기 위해 설계된 **다단계 분석 프로세스**를 통해 신뢰도 높은 매매 신호를 제공합니다.

-   **1단계: 사용자 입력 우선 처리**: 사용자가 입력한 종목명 또는 티커로 먼저 주가 데이터 조회를 시도합니다.
-   **2단계: AI 티커 변환 (필요시)**: 1단계 조회 실패 시, AI가 사용자 입력을 가장 가능성 높은 야후 파이낸스 티커(예: '애플' -> 'AAPL')로 변환하고, 변환된 티커의 유효성을 재검증합니다.
-   **3단계: AI 기술 지표 추천**: 검증된 티커와 과거 1년치 주가 데이터를 기반으로, AI는 현재 시장 상황에 가장 적합한 **3가지 기술 지표(예: RSI, MACD)와 최적의 매개변수**를 추천합니다.
-   **4단계: 최종 신호 생성 및 시각화**: 추천된 지표들을 실제로 계산하여 과거 데이터에 대한 매수/매도 신호를 생성하고, 이를 종합하여 **"강한 매수", "매수", "보류", "매도", "강한 매도"** 5단계의 명확한 최신 매매 신호를 제시합니다.

### 4. 📧 이메일 구독 및 자동 알림

-   **이메일 구독**: '매매 타이밍 분석' 페이지에서 분석이 완료된 종목에 대해, 향후 매매 신호 발생 시 알림을 받도록 이메일을 등록할 수 있습니다.
-   **자동 분석 및 알림**: 서버는 매일 **한국 표준시(KST) 오전 5시**에 모든 구독 종목의 신호를 자동으로 재분석하여, 신호가 '보류'가 아닐 경우에만 구독자에게 이메일로 알림을 보냅니다.

---

## 🛠️ 기술 스택 및 아키텍처

-   **프론트엔드**:
    -   [**Next.js**](https://nextjs.org/) - React 프레임워크 (App Router 기반)
    -   [**React**](https://react.dev/) & [**TypeScript**](https://www.typescriptlang.org/)
    -   [**Tailwind CSS**](https://tailwindcss.com/) & [**ShadCN/UI**](https://ui.shadcn.com/)
    -   [**Recharts**](https://recharts.org/) - 차트 시각화
-   **백엔드 & AI**:
    -   [**Genkit**](https://firebase.google.com/docs/genkit) - AI 플로우 관리 및 실행을 위한 프레임워크
    -   **HyperClova X** - Genkit을 통해 호출되는 핵심 LLM
    -   **Next.js Server Actions** - 프론트엔드와 백엔드 간의 원활하고 안전한 통신
    -   [**Nodemailer**](https://nodemailer.com/) - 이메일 발송
-   **데이터 소스**:
    -   [**Yahoo Finance**](https://finance.yahoo.com/) - 주가 데이터 조회 (`yahoo-finance2` 라이브러리 사용)
    -   **JSON 파일 (`/src/data/subscriptions.json`)** - 이메일 구독자 정보 저장을 위한 로컬 데이터베이스
-   **안정성 및 복원력 (Stability & Resilience)**:
    -   **이중 AI 파이프라인**: [생성 AI]가 만든 초안을 [검수 AI]가 비즈니스 규칙에 맞게 편집하여 결과물의 안정성을 보장합니다.
    -   **API 자동 재시도**: HyperClova X API 호출 실패 시, 최대 3회까지 자동 재시도 로직을 구현하여 일시적인 오류에 대응합니다.
    -   **Zod 스키마 검증**: AI의 응답을 Zod 스키마로 엄격하게 파싱하고 검증하여 데이터 무결성을 확보합니다. (`coerce` 옵션을 통해 유연성 확보)
    -   **단계별 검증 프로세스**: '매매 타이밍 분석'의 각 단계를 순차적으로 검증하여 프로세스 중단 없이 명확한 피드백을 제공합니다.

---

## ⚙️ 프로젝트 구조

```
/
├── public/                 # 정적 파일 (이미지 등)
├── src/
│   ├── ai/
│   │   └── flows/          # Genkit AI 플로우
│   │       ├── investment-strategy-generator.ts # 맞춤 투자 전략 생성 (생성+검수 AI)
│   │       ├── investment-strategy-validator.ts # 데이터 스키마 및 타입 정의
│   │       ├── market-insight-analyzer.ts     # 시장 뉴스 분석
│   │       ├── financial-qa-flow.ts           # 내 전략 기반 Q&A
│   │       ├── stock-signal-generator.ts      # 매매 신호 분석 (지표 추천)
│   │       ├── ticker-converter.ts            # 회사명 -> 티커 변환
│   │       └── subscribeToSignals.ts          # 이메일 구독 처리
│   ├── app/                # Next.js App Router (페이지, 레이아웃, API)
│   ├── components/         # React 컴포넌트 (UI 및 기능별)
│   ├── data/
│   │   └── subscriptions.json # 이메일 구독자 정보 저장
│   ├── hooks/              # 커스텀 React Hooks (useToast, useMobile)
│   ├── lib/                # 유틸리티 함수 (cn 등)
│   └── services/           # 외부 서비스 연동 로직
│       ├── emailService.ts # Nodemailer 설정 및 이메일 발송
│       ├── hyperclova.ts   # HyperClova X API 호출 클라이언트 (자동 재시도)
│       ├── indicatorService.ts # 기술적 지표 계산 로직
│       ├── stockService.ts # 야후 파이낸스 주식 데이터 조회
│       └── subscriptionService.ts # 구독자 정보(JSON) CRUD
├── .env                    # 환경 변수 설정 파일 (API 키 등)
└── ...
```

---

## 🚀 시작하기

### 1. 사전 준비
-   [Node.js](https://nodejs.org/en) (v18 이상 권장)
-   [pnpm](https://pnpm.io/installation) (또는 npm, yarn)

### 2. 프로젝트 클론 및 의존성 설치
```bash
git clone <repository_url>
cd GoldenLifeNavigator
pnpm install
```

### 3. 환경 변수 설정
프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 아래 내용을 실제 값으로 채워넣으세요.

```env
# HyperClova X API Keys
# 네이버 클라우드 플랫폼에서 발급받은 API 정보를 입력하세요.
HYPERCLOVA_API_KEY="여기에_발급받은_API_키를_입력하세요"
HYPERCLOVA_REQUEST_ID="여기에_요청_ID를_입력하세요"

# Gmail SMTP for Nodemailer
# 이메일 발송을 위한 Gmail 계정 정보입니다.
# Gmail 사용 시, 계정 설정에서 2단계 인증을 활성화하고 '앱 비밀번호'를 생성하여 사용해야 합니다.
SMTP_SERVER="smtp.gmail.com"
SMTP_PORT=587
SMTP_USERNAME="your-email@gmail.com"
SMTP_PASSWORD="your_gmail_app_password"

# CRON Job Secret
# 외부 스케줄러가 /api/cron 엔드포인트를 호출할 때 사용할 비밀 키입니다.
CRON_SECRET="여기에_아무도_추측할_수_없는_비밀_문자열을_입력하세요"
```

### 4. 개발 서버 실행
아래 명령어를 실행하여 개발 서버를 시작합니다.
```bash
pnpm run dev
```
서버가 성공적으로 시작되면, 브라우저에서 `http://localhost:9002` 로 접속하여 애플리케이션을 확인할 수 있습니다.

---

## 🤝 기여 방법
이 프로젝트에 기여하고 싶으시다면 언제든지 환영합니다. 버그 리포트, 기능 제안 등은 GitHub 이슈를 통해 남겨주세요. Pull Request를 보내주시면 더욱 좋습니다.
```