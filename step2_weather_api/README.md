# Step 2: 날씨 API 연동

## 🎯 학습 목표

- Function Calling (도구 사용) 개념 이해
- 외부 API 연동 방법
- AI가 도구를 선택하고 사용하는 패턴 학습
- **모듈 분리를 통한 코드 구조화**

## 📁 파일 구조

```
step2_weather_api/
├── app.js              # 메인 실행 파일
├── weather-api.js      # ⭐ Step2에서 새로 추가된 모듈
└── README.md
```

### 파일 역할

| 파일 | 역할 | 실행 가능 |
|------|------|----------|
| `app.js` | 메인 로직, UI 처리 | ✅ |
| `weather-api.js` | 날씨 API 연동 모듈 | ❌ (import용) |

## 📝 구현 내용

### ⭐ Step2에서 새로 추가된 것

#### 1. **weather-api.js 모듈** (새 파일)

```javascript
// 📤 Export 하는 것들
export const cityCoordinates = { ... };  // 도시 좌표 데이터
export function getBaseDateTime() { ... }  // 발표 시각 계산
export async function getWeather(city) { ... }  // 날씨 조회
export const weatherTool = { ... };  // Function Calling 도구 정의
```

**이 모듈이 하는 일**:
- 기상청 API 키 확인
- 한국 주요 도시 좌표 데이터 제공
- 날씨 조회 함수 구현
- Gemini Function Calling 도구 정의

#### 2. **app.js에서 모듈 사용**

```javascript
// weather-api.js에서 가져오기
import { getWeather, weatherTool } from './weather-api.js';

// 모델에 도구 등록
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  tools: [weatherTool]  // ← weather-api.js에서 가져온 도구
});

// Function Call 처리
if (functionCall.name === 'getWeather') {
  functionResult = await getWeather(functionCall.args.city);
}
```

### 핵심 기능
- 기상청 단기예보 API를 통한 실시간 날씨 조회
- Gemini Function Calling으로 AI가 자동으로 날씨 도구 호출
- 한국 주요 도시 지원 (서울, 부산, 대구, 인천, 광주, 대전, 울산, 세종, 수원, 제주)
- 도시명을 자연어로 입력 (예: "서울 날씨 알려줘")

### Function Calling 동작 방식

```
1. 사용자: "서울 날씨 알려줘"
2. AI 분석: 날씨 정보가 필요함 → getWeather 함수 호출 결정
3. 파라미터 추출: city = "서울"
4. 함수 실행: weather-api.js의 getWeather() 실행
5. 결과 통합: AI가 날씨 데이터를 자연어로 변환
6. 최종 응답: "서울의 현재 날씨는 맑음, 기온은 15도입니다."
```

## 🚀 실행 방법

**주의**: 기상청 API 서비스 키가 필요합니다.

1. https://www.data.go.kr/data/15084084/openapi.do 에서 무료 API 키 발급
2. `.env` 파일에 `KMA_API_KEY` 추가

```bash
npm run step2
```

## 💬 사용 예시

```
🤖 AI Agent Tutorial - Step 2: 날씨 API 연동

당신: 서울 날씨 알려줘

🔧 도구 사용: getWeather({"city":"서울"})

AI: 서울의 현재 기온은 15°C이며, 습도는 60%입니다.
    현재 강수는 없습니다.

당신: 부산은 어때?

🔧 도구 사용: getWeather({"city":"부산"})

AI: 부산의 현재 기온은 18°C이며, 습도는 65%입니다.

당신: 안녕?

AI: 안녕하세요! 무엇을 도와드릴까요?
```

## 🔑 핵심 코드

### weather-api.js 구조

```javascript
import axios from 'axios';
import dotenv from 'dotenv';

// 1. 도시 좌표 데이터
export const cityCoordinates = {
  '서울': { nx: 60, ny: 127, name: '서울' },
  '부산': { nx: 98, ny: 76, name: '부산' },
  // ...
};

// 2. 발표 시각 계산
export function getBaseDateTime() {
  // 기상청은 매시 30분에 발표
  // ...
}

// 3. 날씨 조회 함수
export async function getWeather(city) {
  const coords = cityCoordinates[city];
  const { baseDate, baseTime } = getBaseDateTime();

  // 기상청 API 호출
  const response = await axios.get(url, { params });

  // 데이터 파싱 및 반환
  return {
    city, temperature, humidity, rainfall, precipType, windSpeed
  };
}

// 4. Function Calling 도구 정의
export const weatherTool = {
  functionDeclarations: [{
    name: 'getWeather',
    description: '특정 도시의 현재 날씨 정보를 가져옵니다',
    parameters: { /* ... */ }
  }]
};
```

### app.js에서 import

```javascript
// weather-api.js 모듈 가져오기
import { getWeather, weatherTool } from './weather-api.js';

// Gemini 모델에 도구 등록
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  tools: [weatherTool]  // weatherTool 등록
});

// Function Call 처리
if (functionCall.name === 'getWeather') {
  functionResult = await getWeather(functionCall.args.city);
}
```

## 💡 왜 모듈로 분리했나요?

### 장점
✅ **관심사 분리**: 날씨 관련 코드가 한 곳에 모여있음
✅ **재사용성**: 다른 프로젝트에서 weather-api.js만 복사해서 사용 가능
✅ **테스트 용이**: 날씨 API만 독립적으로 테스트 가능
✅ **가독성**: app.js는 메인 로직만 집중

### Step1과 비교

| Step 1 | Step 2 |
|--------|--------|
| 모든 코드가 app.js에 | 기능별로 파일 분리 |
| 78줄 | app.js: 114줄<br/>weather-api.js: 153줄 |
| 대화만 가능 | 대화 + 날씨 조회 |

## 📌 다음 단계

**Step 3**에서는 **SQLite**를 추가하여 사용자 위치 정보를 저장합니다.

**db-functions.js** 모듈이 추가되며, 날씨 API와 DB를 함께 사용하는 방법을 배웁니다! 💾
