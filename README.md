# GoldenLife Navigator

GoldenLife Navigator는 사용자의 투자 성향과 목표에 맞춰 AI가 개인화된 투자 전략을 추천하고, 시장 분석 및 매매 타이밍 신호를 제공하는 차세대 금융 어드바이저 웹 애플리케이션입니다.

![GoldenLife Navigator Screenshot](https://placehold.co/800x450.png?text=GoldenLife+Navigator+UI)
*<p align="center">실제 애플리케이션 데모 UI (참고용 이미지)</p>*

## ✨ 주요 기능

1.  **🤖 맞춤형 투자 전략 설문 (`/survey`)**
    *   사용자는 은퇴 시기, 목표 소득, 자산 규모, 위험 감수 수준 등 10가지 질문으로 구성된 설문에 답변합니다.
    *   입력된 내용은 HyperClova X AI 모델로 전달되어 개인에게 최적화된 투자 포트폴리오를 생성합니다.

2.  **📊 내 전략 확인 (`/strategy`)**
    *   AI가 생성한 맞춤 전략을 시각적으로 확인하는 페이지입니다.
    *   **자산 배분**: 주식, 채권, 현금 비중을 보여주는 동적 파이 차트.
    *   **ETF/주식 추천**: AI가 선정한 3-4개의 추천 종목과 그 이유를 명확하게 제시합니다.
    *   **거래 전략 및 설명**: 포트폴리오 운용 방식과 AI의 추천 근거를 상세히 설명합니다.

3.  **📈 AI 시장 해설 및 인사이트 (`/strategy`)**
    *   사용자가 최신 시장 뉴스나 동향에 대한 텍스트를 입력하면, AI가 이를 분석합니다.
    *   **시장 요약, 제안 조치, 근거** 세 부분으로 나누어 깊이 있는 분석 결과를 제공받을 수 있습니다.

4.  **⏱️ AI 매매 타이밍 분석 (`/timing`)**
    *   관심 있는 주식 티커(예: AAPL)와 매매 전략(선택 사항)을 입력합니다.
    *   AI는 해당 종목과 전략에 가장 적합한 **3가지 기술 지표**를 추천합니다.
    *   추천된 지표를 종합하여 **"강한 매수", "매수", "보류", "매도", "강한 매도"** 5단계의 명확한 매매 신호를 제시합니다.
    *   과거 1년간의 주가 데이터를 기반으로 한 시각적 차트도 함께 제공됩니다.

5.  **📧 이메일 구독 및 자동 알림**
    *   매매 타이밍 분석 페이지에서 원하는 종목에 대한 신호 알림을 이메일로 구독할 수 있습니다.
    *   구독 시, 어떤 기술 지표로 분석이 이루어질지 안내하는 환영 메일이 발송됩니다.
    *   서버는 매일 **한국 표준시(KST) 오전 5시**에 모든 구독 종목의 신호를 자동으로 분석하여, '보류'가 아닐 경우 구독자에게 이메일로 알림을 보냅니다.

## 🛠️ 기술 스택

-   **프론트엔드**:
    -   [**Next.js**](https://nextjs.org/) - React 프레임워크 (App Router)
    -   [**React**](https://react.dev/) - 사용자 인터페이스 구축
    -   [**TypeScript**](https://www.typescriptlang.org/) - 타입 안정성 확보
    -   [**Tailwind CSS**](https://tailwindcss.com/) - 유틸리티 우선 CSS 프레임워크
    -   [**ShadCN/UI**](https://ui.shadcn.com/) - 재사용 가능한 UI 컴포넌트 라이브러리
    -   [**Recharts**](https://recharts.org/) - 주가 및 자산 배분 차트 시각화
-   **백엔드 & AI**:
    -   [**HyperClova X**](https://clovastudio.ncloud.com/) - 핵심 투자 전략 및 분석을 위한 Naver의 LLM
    -   **Next.js Server Actions** - 프론트엔드와 백엔드 간의 원활한 통신
    -   [**Nodemailer**](https://nodemailer.com/) - 이메일 발송을 위한 모듈
    -   [**Node-cron**](https://github.com/node-cron/node-cron) - 매일 아침 자동 신호 분석 및 발송을 위한 스케줄러
-   **데이터**:
    -   [**Yahoo Finance API**](https://github.com/gadicc/node-yahoo-finance2) - 실시간 주가 데이터 및 과거 데이터 조회
    -   **JSON 파일** - 이메일 구독자 정보 저장을 위한 간단한 로컬 데이터베이스

## ⚙️ 프로젝트 구조

```
/
├── public/                 # 정적 파일 (이미지, 폰트 등)
├── src/
│   ├── ai/
│   │   ├── dev.ts          # 개발 서버 시작 시 AI 모듈 및 스케줄러 초기화
│   │   └── flows/          # AI 핵심 로직 (HyperClova X 호출)
│   ├── app/                # Next.js App Router (페이지 및 레이아웃)
│   ├── components/         # React 컴포넌트
│   │   ├── layout/         # Header, Footer 등 레이아웃 컴포넌트
│   │   ├── strategy/       # '내 전략' 페이지 관련 컴포넌트
│   │   ├── survey/         # '설문' 페이지 관련 컴포넌트
│   │   ├── timing/         # '매매 타이밍' 페이지 관련 컴포넌트
│   │   └── ui/             # ShadCN/UI 기본 컴포넌트
│   ├── data/
│   │   └── subscriptions.json # 이메일 구독자 정보 저장
│   ├── hooks/              # 커스텀 React Hooks
│   ├── lib/                # 유틸리티 함수 (cn 등)
│   └── services/           # 외부 서비스 연동 로직
│       ├── emailService.ts # Nodemailer 설정 및 이메일 발송, 스케줄링
│       ├── hyperclova.ts   # HyperClova X API 호출 클라이언트
│       ├── stockService.ts # Yahoo Finance 주식 데이터 조회
│       └── subscriptionService.ts # 구독자 정보(JSON) CRUD
├── .env                    # 환경 변수 설정 파일 (API 키 등)
└── ...
```

## 🚀 시작하기

### 1. 사전 준비

-   [Node.js](https://nodejs.org/en) (v18 이상 권장)
-   [pnpm](https://pnpm.io/installation) (또는 npm, yarn)

### 2. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository_url>
cd GoldenEyeNavigator
pnpm install
```

### 3. 환경 변수 설정

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 아래 내용을 채워넣으세요.

```env
# HyperClova X API Keys
HYPERCLOVA_API_KEY="여기에_발급받은_API_키를_입력하세요"
HYPERCLOVA_REQUEST_ID="여기에_요청_ID를_입력하세요"

# Gmail SMTP for Nodemailer
# (Gmail 사용 시, 2단계 인증 및 앱 비밀번호 설정이 필요합니다.)
SMTP_SERVER="smtp.gmail.com"
SMTP_PORT=587
SMTP_USERNAME="your-email@gmail.com"
SMTP_PASSWORD="your_gmail_app_password"
```

### 4. 개발 서버 실행

아래 명령어를 실행하여 개발 서버를 시작합니다.

```bash
pnpm run dev
```

서버가 성공적으로 시작되면, 브라우저에서 `http://localhost:9002` 로 접속하여 애플리케이션을 확인할 수 있습니다.

## 🤝 기여 방법

프로젝트에 기여하고 싶으시다면 언제든지 환영합니다. 버그 리포트, 기능 제안 등은 GitHub 이슈를 통해 남겨주세요.
