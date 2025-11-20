# AI Agent Tutorial - Google Gemini (Node.js)

단계별로 AI Agent를 구축하는 튜토리얼입니다.

## 🎯 학습 목표

- AI Agent의 기본 개념 이해
- Function Calling 활용
- Database 연동 및 상태 관리
- 실용적인 Agent 시스템 구축

## 📚 튜토리얼 단계

### Step 1: 기본 대화 Agent
**파일**: `app.js`
- Google Gemini API 연동
- 터미널 기반 대화 구현
- 스트리밍 응답 출력

### Step 2: 날씨 API 연동
**파일**: `app.js`, **`weather-api.js`** ⭐
- Function Calling 개념 학습
- 외부 API 연동 (기상청 단기예보 API)
- **모듈 분리**: 날씨 기능을 별도 파일로

### Step 3: Database 통합
**파일**: `app.js`, `weather-api.js`, **`db-functions.js`** ⭐
- SQLite를 통한 데이터 저장
- 자연어로 DB 조작
- **모듈 추가**: DB 기능을 별도 파일로
- "오형석은 대전에 살아" → DB 저장

### Step 4: 사용자 기반 날씨 조회 (완성)
**파일**: `app.js`, `weather-api.js`, `db-functions.js`, **`user-weather.js`** ⭐
- DB 조회 + API 호출 통합
- **모듈 추가**: DB와 API를 통합하는 로직
- "오형석 날씨 알려줘" → 자동 위치 조회 후 날씨 제공
- 완성된 Agent 시스템

## 📁 프로젝트 구조

```
AgentTutorial/
├── step1_basic_chat/
│   ├── app.js          # 기본 대화 Agent
│   └── README.md
│
├── step2_weather_api/
│   ├── app.js              # 메인 실행 파일
│   ├── weather-api.js      # ⭐ 날씨 API 모듈 (Step2에서 추가)
│   └── README.md
│
├── step3_db_integration/
│   ├── app.js              # 메인 실행 파일
│   ├── weather-api.js      # 날씨 API 모듈 (Step2와 동일)
│   ├── db-functions.js     # ⭐ DB 관리 모듈 (Step3에서 추가)
│   └── README.md
│
├── step4_user_weather/
│   ├── app.js              # 메인 실행 파일
│   ├── weather-api.js      # 날씨 API 모듈 (Step2와 동일 + 강남/동구 추가)
│   ├── db-functions.js     # DB 관리 모듈 (Step3와 동일)
│   ├── user-weather.js     # ⭐ DB + API 통합 모듈 (Step4에서 추가)
│   └── README.md
│
├── package.json
├── .env                # API 키 설정 파일
└── README.md
```

### 각 Step별 파일 변화

| Step | 파일 수 | 새로 추가된 파일 |
|------|---------|------------------|
| Step 1 | 1개 | - |
| Step 2 | 2개 | `weather-api.js` |
| Step 3 | 3개 | `db-functions.js` |
| Step 4 | 4개 | `user-weather.js` |

## 🚀 시작하기

### 1. API 키 발급

#### Google Gemini API 키 발급
1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. Google 계정으로 로그인
3. "Get API Key" 또는 "Create API Key" 버튼 클릭
4. 새 프로젝트 생성 또는 기존 프로젝트 선택
5. API 키 복사 (안전한 곳에 보관)

**참고사항:**
- Gemini API는 무료 tier 제공 (분당 요청 제한 있음)
- API 키는 절대 GitHub 등 공개 저장소에 업로드하지 마세요
- `.env` 파일은 `.gitignore`에 포함되어 있어야 합니다

#### 기상청 단기예보 API 키 발급
1. [공공데이터포털](https://www.data.go.kr/) 접속
2. 회원가입 및 로그인
3. [기상청 단기예보 API](https://www.data.go.kr/data/15084084/openapi.do) 페이지 이동
4. "활용신청" 버튼 클릭
5. 활용 목적 및 상세 기능 정보 입력
   - 활용 목적: 학습/개발
   - 상세 기능 정보: AI Agent 튜토리얼 학습용
6. 신청 완료 후 승인 대기 (보통 즉시 승인)
7. 마이페이지 > 오픈API > 개발계정 상세보기에서 일반 인증키(Encoding) 확인

**참고사항:**
- 승인까지 수 분 ~ 수 시간 소요될 수 있습니다
- 일반 인증키(Encoding)를 사용해야 합니다
- 일일 트래픽 제한이 있을 수 있으니 확인하세요

### 2. 환경 설정

```bash
# 패키지 설치
npm install

# .env 파일 생성 및 설정
# 프로젝트 루트에 .env 파일을 생성하고 아래 내용을 입력하세요
```

`.env` 파일 예시:
```
GOOGLE_AI_KEY=your_google_gemini_api_key_here
KMA_API_KEY=your_kma_service_key_here
```

### 3. 단계별 실행

```bash
# Step 1: 기본 대화
npm run step1

# Step 2: 날씨 확인
npm run step2

# Step 3: DB 저장
npm run step3

# Step 4: 완성본
npm run step4
```

## 📖 핵심 개념

### Agent란?

AI Agent는 단순한 챗봇을 넘어서 **실제 작업을 수행할 수 있는 자율적인 AI 시스템**입니다.

#### Agent의 3가지 핵심 구성 요소

1. **LLM (Large Language Model)**
   - 사용자의 자연어 입력을 이해
   - 상황에 맞는 적절한 도구(Tool) 선택
   - 작업 결과를 자연어로 설명

2. **Tools (도구)**
   - 외부 API 호출 (날씨, 검색, 번역 등)
   - 데이터베이스 CRUD 작업
   - 파일 시스템 접근
   - 계산, 변환 등 유틸리티 함수

3. **Memory (메모리)**
   - 대화 히스토리 저장
   - 사용자 정보 기억 (DB)
   - 컨텍스트 유지

#### Agent의 동작 방식

```
사용자: "오형석 날씨 알려줘"
    ↓
[AI가 분석]
- DB에서 "오형석" 위치 정보 조회 필요
- 조회된 위치의 날씨 API 호출 필요
    ↓
[Tool 1 실행] getUserLocation("오형석") → "대전"
    ↓
[Tool 2 실행] getWeather("대전") → 날씨 데이터
    ↓
[AI가 통합하여 응답]
"오형석님이 사는 대전 동구의 현재 날씨는 맑음이고,
기온은 15도입니다."
```

#### 일반 챗봇 vs AI Agent

| 구분 | 일반 챗봇 | AI Agent |
|------|-----------|----------|
| 기능 | 대화만 가능 | 실제 작업 수행 |
| 도구 사용 | ❌ 불가능 | ✅ 외부 API, DB 연동 |
| 상태 기억 | 대화 내에서만 | DB에 영구 저장 |
| 자율성 | 단순 응답 | 필요한 도구 자동 선택 |
| 예시 | "날씨가 어떤가요?" 라고 물으면<br/>학습된 지식으로만 답변 | "날씨가 어떤가요?" 라고 물으면<br/>실시간 API를 호출해 정확한 정보 제공 |

### Function Calling
- AI가 함수 호출 시점과 파라미터 결정
- 외부 API, DB 등 실제 작업 수행
- 결과를 다시 AI에게 전달해 최종 응답 생성

### Tool Use Pattern
```
사용자 입력 → AI 분석 → Tool 선택 → Tool 실행 → 결과 통합 → 응답
```

## 🛠 기술 스택

- **LLM**: Google Gemini 2.5 Flash
- **DB**: SQLite3 (better-sqlite3)
- **API**: 기상청 단기예보 API (공공데이터포털)
- **Runtime**: Node.js 20+

## 📌 참고사항

각 단계 디렉토리에 상세한 README.md가 포함되어 있습니다.

## 🎓 학습 로드맵

### 모듈 분리의 이점

이 튜토리얼에서는 **기능별 모듈 분리** 패턴을 사용합니다:

1. **Step 1**: 모든 코드가 `app.js`에
2. **Step 2**: 날씨 기능을 `weather-api.js`로 분리
3. **Step 3**: DB 기능을 `db-functions.js`로 분리
4. **Step 4**: DB + API 통합을 `user-weather.js`로 분리

**장점**:
- ✅ **명확한 구분**: 각 Step에서 추가된 기능을 쉽게 파악
- ✅ **재사용성**: 필요한 모듈만 다른 프로젝트에 복사 가능
- ✅ **유지보수성**: 버그 수정 시 해당 모듈만 수정
- ✅ **테스트 용이**: 각 모듈을 독립적으로 테스트 가능

### 튜토리얼 진행 순서

```
Step 1: 대화만 가능
   ↓
Step 2: + 날씨 조회 (API)
   ↓
Step 3: + 사용자 정보 저장 (DB)
   ↓
Step 4: DB + API 통합 (완성)
```

### Agent 구성 요소 학습 순서

| Step | LLM | Tools | Memory | Modularity |
|------|-----|-------|--------|------------|
| 1 | ✅ | ❌ | ❌ | ❌ |
| 2 | ✅ | ✅ | ❌ | ✅ |
| 3 | ✅ | ✅ | ✅ | ✅ |
| 4 | ✅ | ✅ | ✅ | ✅✅ |

## 🎤 튜토리얼 설명 가이드

각 Step을 설명할 때:

1. **Step 1**: "기본 대화만 가능한 AI를 만듭니다"
2. **Step 2**: "`weather-api.js`가 추가되어 실시간 날씨를 조회할 수 있게 됩니다"
3. **Step 3**: "`db-functions.js`가 추가되어 사용자 정보를 기억할 수 있게 됩니다"
4. **Step 4**: "`user-weather.js`가 추가되어 DB와 API를 통합, '오형석 날씨 알려줘' 같은 복잡한 요청을 처리할 수 있게 됩니다"

## 🚀 다음 단계

이 튜토리얼을 완료한 후:
- 다른 API 연동 (뉴스, 주식, 번역 등)
- 더 복잡한 워크플로우 구현
- 웹 인터페이스 추가
- 멀티 턴 대화 고도화
- RAG (Retrieval-Augmented Generation) 적용
