# Step 3: Database 통합

## 🎯 학습 목표

- SQLite를 통한 데이터 영속성
- 자연어로 데이터베이스 조작
- AI Agent의 메모리(상태 관리)
- **두 개의 모듈을 통합하는 방법**

## 📁 파일 구조

```
step3_db_integration/
├── app.js              # 메인 실행 파일
├── weather-api.js      # 날씨 API 모듈 (Step2와 동일)
├── db-functions.js     # ⭐ Step3에서 새로 추가된 모듈
└── README.md
```

### 파일 역할

| 파일 | 역할 | 실행 가능 | 출처 |
|------|------|----------|------|
| `app.js` | 메인 로직, 두 모듈 통합 | ✅ | |
| `weather-api.js` | 날씨 API 연동 | ❌ | Step2 |
| `db-functions.js` | DB 저장/조회 | ❌ | **새로 추가** |

## 📝 구현 내용

### ⭐ Step3에서 새로 추가된 것

#### 1. **db-functions.js 모듈** (새 파일)

```javascript
// 📤 Export 하는 것들
export const db = ...;  // SQLite 데이터베이스 인스턴스
export function saveUserLocation(name, location) { ... }  // 저장
export function getUserLocation(name) { ... }  // 조회
export function listAllUsers() { ... }  // 목록
export const dbTools = { ... };  // Function Calling 도구 정의
```

**이 모듈이 하는 일**:
- SQLite 데이터베이스 초기화
- `users` 테이블 생성
- 사용자 정보 CRUD 함수 제공
- Gemini Function Calling 도구 정의

#### 2. **app.js에서 두 모듈 통합**

```javascript
// 두 모듈에서 필요한 것들 가져오기
import { getWeather, weatherTool } from './weather-api.js';
import { db, saveUserLocation, getUserLocation, listAllUsers, dbTools } from './db-functions.js';

// 두 모듈의 도구를 합치기
const tools = {
  functionDeclarations: [
    ...weatherTool.functionDeclarations,  // 날씨 도구
    ...dbTools.functionDeclarations        // DB 도구
  ]
};

// 통합된 도구로 모델 초기화
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  tools: [tools]
});
```

### 핵심 기능
- **사용자 위치 저장**: "오형석은 대전에 살아"
- **사용자 위치 조회**: "오형석이 어디 살아?"
- **전체 사용자 목록**: "등록된 사람들 보여줘"
- **날씨 조회**: "서울 날씨 알려줘" (Step 2 기능 유지)

### 데이터베이스 스키마

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 실행 방법

```bash
npm run step3
```

**자동으로 `users.db` 파일이 생성됩니다.**

## 💬 사용 예시

```
🤖 AI Agent Tutorial - Step 3: Database 통합

당신: 오형석은 대전에 살아

🔧 도구 사용: saveUserLocation({"name":"오형석","location":"대전"})

AI: 오형석님의 위치를 대전로 저장했습니다!

당신: 김철수는 서울에 살아
AI: 김철수님의 위치를 서울로 저장했습니다!

당신: 오형석는 어디 살아?

🔧 도구 사용: getUserLocation({"name":"오형석"})

AI: 오형석님은 대전에 살고 계십니다.

당신: 등록된 사람들 보여줘

🔧 도구 사용: listAllUsers()

AI: 현재 등록된 사용자는 다음과 같습니다:
    - 오형석: 대전
    - 김철수: 서울

당신: 서울 날씨 알려줘

🔧 도구 사용: getWeather({"city":"서울"})

AI: 서울의 현재 날씨는...
```

## 🔑 핵심 코드

### db-functions.js 구조

```javascript
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 1. 데이터베이스 초기화
export const db = new Database(join(__dirname, 'users.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 2. 사용자 위치 저장
export function saveUserLocation(name, location) {
  const stmt = db.prepare('INSERT OR REPLACE INTO users (name, location) VALUES (?, ?)');
  stmt.run(name, location);
  return { success: true, message: `${name}님의 위치를 ${location}로 저장했습니다.` };
}

// 3. 사용자 위치 조회
export function getUserLocation(name) {
  const stmt = db.prepare('SELECT location FROM users WHERE name = ?');
  const result = stmt.get(name);
  if (result) {
    return { success: true, name, location: result.location };
  } else {
    return { success: false, message: `${name}님의 정보를 찾을 수 없습니다.` };
  }
}

// 4. 전체 사용자 목록
export function listAllUsers() {
  const stmt = db.prepare('SELECT name, location FROM users ORDER BY created_at DESC');
  const users = stmt.all();
  return { success: true, users };
}

// 5. Function Calling 도구 정의
export const dbTools = {
  functionDeclarations: [
    { name: 'saveUserLocation', /* ... */ },
    { name: 'getUserLocation', /* ... */ },
    { name: 'listAllUsers', /* ... */ }
  ]
};
```

### app.js에서 통합

```javascript
// 두 모듈 import
import { getWeather, weatherTool } from './weather-api.js';
import { db, saveUserLocation, getUserLocation, listAllUsers, dbTools } from './db-functions.js';

// 도구 통합
const tools = {
  functionDeclarations: [
    ...weatherTool.functionDeclarations,  // getWeather
    ...dbTools.functionDeclarations        // save, get, list
  ]
};

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
    default:
      return { error: '알 수 없는 함수입니다.' };
  }
}
```

## 💡 왜 모듈로 분리했나요?

### 장점
✅ **책임 분리**: 날씨는 weather-api.js, DB는 db-functions.js
✅ **독립적 테스트**: 각 모듈을 따로 테스트 가능
✅ **재사용성**: 다른 프로젝트에서 필요한 모듈만 가져가기 쉬움
✅ **유지보수**: 버그 수정 시 해당 모듈만 수정

### Step2와 비교

| Step 2 | Step 3 |
|--------|--------|
| weather-api.js | weather-api.js (그대로)<br/>**+ db-functions.js** |
| 1개 도구 (getWeather) | 4개 도구 (날씨 1 + DB 3) |
| 날씨만 조회 가능 | 날씨 + 사용자 정보 관리 |

## 📊 핵심 개념

### Agent의 메모리
- **단기 메모리**: 대화 컨텍스트 (Step 1-2)
- **장기 메모리**: 데이터베이스 (Step 3) ← 새로 추가!

### 멀티 도구 Agent
- AI가 상황에 맞는 도구를 **자동 선택**
- 날씨 조회 vs DB 조작을 AI가 판단
- 복잡한 if-else 없이 자연어 처리

### 상태 관리 패턴
```
사용자 입력
  ↓
AI 분석 → 도구 선택 (날씨? DB?)
  ↓
도구 실행 (weather-api.js or db-functions.js)
  ↓
결과를 DB에 저장 or 조회
  ↓
자연어 응답
```

## 📌 다음 단계

**Step 4**에서는 DB와 날씨 API를 **결합**합니다.

**"오형석 날씨 알려줘"** → DB에서 위치 조회 → 날씨 API 호출

**user-weather.js** 모듈이 추가되어 두 모듈을 통합하는 방법을 배웁니다! 🚀
