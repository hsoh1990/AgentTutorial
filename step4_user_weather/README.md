# Step 4: 사용자 기반 날씨 조회 (완성본)

## 🎯 학습 목표

- 멀티 모듈 통합 및 조율
- DB와 API를 결합한 복잡한 워크플로우
- 실용적인 AI Agent 완성
- **모듈 간 협력 패턴**

## 📁 파일 구조

```
step4_user_weather/
├── app.js              # 메인 실행 파일
├── weather-api.js      # 날씨 API 모듈 (Step2)
├── db-functions.js     # DB 관리 모듈 (Step3)
├── user-weather.js     # ⭐ Step4에서 새로 추가된 모듈
└── README.md
```

### 파일 역할

| 파일 | 역할 | 실행 가능 | 출처 |
|------|------|----------|------|
| `app.js` | 메인 로직, 세 모듈 통합 | ✅ | |
| `weather-api.js` | 날씨 API 연동 | ❌ | Step2 |
| `db-functions.js` | DB 저장/조회 | ❌ | Step3 |
| `user-weather.js` | **DB + API 통합** | ❌ | **새로 추가** |

## 📝 구현 내용

### ⭐ Step4에서 새로 추가된 것

#### 1. **user-weather.js 모듈** (새 파일)

```javascript
// 📤 Export 하는 것들
export async function getUserWeather(name) { ... }  // 사용자 날씨 조회
export function extractCity(location) { ... }        // 위치에서 도시명 추출
export const userWeatherTool = { ... };              // Function Calling 도구 정의
```

**이 모듈이 하는 일**:
- `getUserWeather()`: DB 조회 + 날씨 API 호출을 **하나의 함수로 통합**
- `extractCity()`: "대전 동구" → "대전" 같은 도시명 추출 로직
- **다른 두 모듈을 import해서 조합**

```javascript
// user-weather.js 내부
import { cityCoordinates, getWeather } from './weather-api.js';
import { getUserLocation } from './db-functions.js';

export async function getUserWeather(name) {
  // 1. DB에서 위치 조회 (db-functions.js 사용)
  const locationResult = getUserLocation(name);

  // 2. 도시명 추출 (내부 로직)
  const city = extractCity(locationResult.location);

  // 3. 날씨 조회 (weather-api.js 사용)
  const weatherResult = await getWeather(city);

  // 4. 통합 결과 반환
  return { name, location, ...weatherResult };
}
```

#### 2. **app.js에서 세 모듈 통합**

```javascript
// 세 모듈에서 필요한 것들 가져오기
import { getWeather, weatherTool } from './weather-api.js';
import { db, saveUserLocation, getUserLocation, listAllUsers, dbTools } from './db-functions.js';
import { getUserWeather, userWeatherTool } from './user-weather.js';

// 세 모듈의 도구를 합치기
const tools = {
  functionDeclarations: [
    ...weatherTool.functionDeclarations,      // 날씨 도구
    ...dbTools.functionDeclarations,          // DB 도구
    ...userWeatherTool.functionDeclarations   // 사용자 날씨 도구
  ]
};

// 통합된 도구로 모델 초기화
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  tools: [tools]
});
```

### 핵심 기능
- **사용자 위치 저장**: "오형석는 대전에 살아"
- **사용자 기반 날씨**: "오형석 날씨 알려줘" ← **Step4의 핵심!**
- **직접 날씨 조회**: "서울 날씨 알려줘"
- **위치 조회**: "오형석는 어디 살아?"

### 멀티 스텝 워크플로우

```
"오형석 날씨 알려줘" 입력
  ↓
AI가 getUserWeather 도구 선택
  ↓
user-weather.js: getUserWeather("오형석") 실행
  ↓
  1. db-functions.js: getUserLocation("오형석") → "대전"
  2. extractCity("대전") → "대전"
  3. weather-api.js: getWeather("대전") → 날씨 데이터
  ↓
AI가 자연어로 종합 응답
```

## 🚀 실행 방법

```bash
npm run step4
```

## 💬 사용 예시 (전체 시나리오)

```
🤖 AI Agent Tutorial - Step 4: 완성된 Agent

=== 1. 사용자 등록 ===
당신: 오형석는 대전에 살아

🔧 도구 사용: saveUserLocation({"name":"오형석","location":"대전"})

AI: 오형석님의 위치를 대전로 저장했습니다!

당신: 김철수는 서울에 살아
AI: 김철수님의 위치를 서울로 저장했습니다!

=== 2. 사용자 기반 날씨 조회 (핵심!) ===
당신: 오형석 날씨 알려줘

🔧 도구 사용: getUserWeather({"name":"오형석"})

AI: 오형석님이 계신 대전의 현재 기온은 15°C이며,
    습도는 60%입니다. 현재 강수는 없습니다.

당신: 김철수 날씨는?

🔧 도구 사용: getUserWeather({"name":"김철수"})

AI: 김철수님이 계신 서울의 현재 날씨는...

=== 3. 직접 날씨 조회 ===
당신: 부산 날씨는?

🔧 도구 사용: getWeather({"city":"부산"})

AI: 부산의 현재 날씨는...

=== 4. 일반 대화 ===
당신: 고마워!
AI: 천만에요! 다른 도움이 필요하시면 언제든 말씀해주세요.
```

## 🔑 핵심 코드

### user-weather.js 구조

```javascript
// 다른 모듈에서 필요한 것 import
import { cityCoordinates, getWeather } from './weather-api.js';
import { getUserLocation } from './db-functions.js';

// 위치에서 도시명 추출
export function extractCity(location) {
  // 1. 정확한 키로 찾기
  if (cityCoordinates[location]) return location;

  // 2. 포함된 도시 찾기
  for (const city of Object.keys(cityCoordinates)) {
    if (location.includes(city)) return city;
  }

  // 3. 첫 단어로 찾기
  const firstWord = location.split(' ')[0];
  if (cityCoordinates[firstWord]) return firstWord;

  return null;
}

// 사용자 기반 날씨 조회 (DB + API 통합)
export async function getUserWeather(name) {
  // 1. DB에서 위치 조회
  const locationResult = getUserLocation(name);
  if (!locationResult.success) {
    return { error: `${name}님의 위치 정보를 찾을 수 없습니다.` };
  }

  // 2. 도시명 추출
  const city = extractCity(locationResult.location);
  if (!city) {
    return { error: `${locationResult.location}에서 도시를 찾을 수 없습니다.` };
  }

  // 3. 날씨 조회
  const weatherResult = await getWeather(city);
  if (weatherResult.error) return weatherResult;

  // 4. 통합 결과 반환
  return {
    success: true,
    name,
    location: locationResult.location,
    city: weatherResult.city,
    temperature: weatherResult.temperature,
    humidity: weatherResult.humidity,
    // ...
  };
}

// Function Calling 도구 정의
export const userWeatherTool = {
  functionDeclarations: [{
    name: 'getUserWeather',
    description: '등록된 사용자의 위치를 기반으로 날씨 정보를 가져옵니다',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: '날씨를 확인할 사용자 이름' }
      },
      required: ['name']
    }
  }]
};
```

### app.js에서 통합

```javascript
// 세 모듈 모두 import
import { getWeather, weatherTool } from './weather-api.js';
import { db, saveUserLocation, getUserLocation, listAllUsers, dbTools } from './db-functions.js';
import { getUserWeather, userWeatherTool } from './user-weather.js';

// 함수 실행 라우터
async function executeFunction(functionCall) {
  const { name, args } = functionCall;

  switch (name) {
    case 'getWeather':
      return await getWeather(args.city);
    case 'saveUserLocation':
      return saveUserLocation(args.name, args.location);
    case 'getUserLocation':
      return getUserLocation(args.name);
    case 'listAllUsers':
      return listAllUsers();
    case 'getUserWeather':  // ← Step4에서 추가!
      return await getUserWeather(args.name);
    default:
      return { error: '알 수 없는 함수입니다.' };
  }
}
```

## 💡 왜 user-weather.js를 따로 만들었나요?

### getUserWeather가 없다면?

AI가 2단계로 처리해야 함:
```
1. getUserLocation("오형석") → "대전"
2. getWeather("대전") → 날씨 정보
```

**문제점**:
- ❌ Function Call 2번 (느림, 비용 증가)
- ❌ AI가 순서를 헷갈릴 수 있음
- ❌ 에러 처리 복잡 (AI가 판단해야 함)

### getUserWeather가 있으면?

```
getUserWeather("오형석") → 통합 결과
```

**장점**:
- ✅ Function Call 1번 (빠름, 저렴)
- ✅ 순서 보장 (함수 내부에서 처리)
- ✅ 에러 처리 간단 (함수가 알아서 처리)
- ✅ 복잡한 로직을 캡슐화 (실무 베스트 프랙티스)

### Step3와 비교

| Step 3 | Step 4 |
|--------|--------|
| weather-api.js<br/>db-functions.js | weather-api.js<br/>db-functions.js<br/>**+ user-weather.js** |
| 4개 도구 | 5개 도구 |
| DB와 API 따로 사용 | **DB + API 통합 사용** |
| "오형석 어디 살아?" | **"오형석 날씨 알려줘"** |

## 📊 핵심 개념

### 모듈 간 협력 패턴

```
user-weather.js (통합 로직)
      ↓
   ┌──┴──┐
   ↓     ↓
db-functions.js  weather-api.js
(위치 조회)      (날씨 조회)
```

**user-weather.js가 다른 두 모듈을 import해서 조합**

### Agent의 자율성

AI가 다음을 **스스로 판단**:
- 어떤 도구를 사용할지 (날씨 직접 vs 사용자 기반)
- 도구를 여러 개 조합할지 (내부적으로 자동)
- 일반 대화로 응답할지

### 복잡한 워크플로우 처리

```
사용자 입력
  ↓
AI 의도 파악
  ↓
├─ 사용자 이름 감지 → getUserWeather → (DB → API)
├─ 도시명 직접 입력 → getWeather → API 호출
├─ 위치 질문 → getUserLocation → DB 조회
└─ 일반 대화 → 직접 응답
```

## 📊 완성된 Agent 시스템 구조

```
┌─────────────────────────────────────┐
│         사용자 인터페이스           │
│         (터미널 입력/출력)          │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│      Gemini AI (의사결정 엔진)      │
│  - 의도 파악                        │
│  - 도구 선택                        │
│  - 자연어 생성                      │
└──────────────┬──────────────────────┘
               ↓
      ┌────────┴────────┐
      ↓                 ↓
┌──────────┐      ┌──────────┐
│   DB     │      │  API     │
│ (SQLite) │◄────►│(Weather) │
│          │      │          │
│ - 사용자 │      │ - 날씨   │
│ - 위치   │      │ - 실시간 │
└──────────┘      └──────────┘
      ▲                 ▲
      └────────┬────────┘
         user-weather.js
         (DB + API 통합)
```

## 🎓 학습 정리

### Step 1 → Step 4 진화 과정

| Step | 파일 | 기능 |
|------|------|------|
| Step 1 | `app.js` | 기본 대화 |
| Step 2 | `app.js`<br/>`weather-api.js` | 대화 + 날씨 조회 |
| Step 3 | `app.js`<br/>`weather-api.js`<br/>`db-functions.js` | 대화 + 날씨 + DB |
| Step 4 | `app.js`<br/>`weather-api.js`<br/>`db-functions.js`<br/>`user-weather.js` | **완성된 Agent** |

### Agent의 핵심 요소
- **LLM**: 의사결정 엔진 (Gemini)
- **Tools**: 실제 작업 수행 (API, DB)
- **Memory**: 상태 유지 (SQLite)
- **Orchestration**: 도구 조율 (Function Calling)
- **Modularity**: 기능별 모듈 분리

## 🚀 확장 아이디어

- 다중 도시 날씨 비교
- 날씨 알림 예약
- 날씨 기록 저장 및 통계
- 지역별 추천 활동
- 다른 API 통합 (뉴스, 주식 등)

## 🎤 발표/설명 포인트

1. **모듈화의 이점**: "각 기능을 별도 파일로 분리하면..."
2. **Agent의 정의**: "LLM + Tools + Memory + Orchestration"
3. **Function Calling**: "AI가 도구를 자율적으로 선택"
4. **실용성**: "복잡한 조건문 없이 자연어로 제어"
5. **확장성**: "새 모듈 추가만으로 기능 확장"

## 🎯 튜토리얼 완성!

축하합니다! 🎉

**기본 대화 AI → 완전한 Agent 시스템**까지 구축했습니다!

이제 여러분은:
- ✅ Gemini API 사용법
- ✅ Function Calling 개념
- ✅ 외부 API 연동
- ✅ 데이터베이스 통합
- ✅ 모듈화 패턴
- ✅ AI Agent 설계 원칙

을 모두 이해하게 되었습니다! 🚀
