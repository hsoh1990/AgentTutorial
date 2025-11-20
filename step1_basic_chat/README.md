# Step 1: 기본 대화 Agent

## 🎯 학습 목표

- Google Gemini API 연동 방법
- 기본적인 대화형 AI 구현
- 터미널 기반 인터페이스 구축

## 📁 파일 구조

```
step1_basic_chat/
├── app.js          # 메인 실행 파일
└── README.md
```

## 📝 구현 내용

### 핵심 기능
- Gemini 2.0 Flash 모델 사용
- 터미널에서 사용자 입력 받기
- AI 응답을 스트리밍으로 출력
- 종료 명령어 처리 (quit, exit, q)

### 코드 구조

```javascript
1. 환경변수에서 API Key 로드
2. Gemini 모델 초기화
3. readline 인터페이스 설정
4. 대화 루프 실행
   - 사용자 입력 받기
   - API 호출 (스트리밍)
   - 응답 출력
```

## 🚀 실행 방법

```bash
npm run step1
```

## 💬 사용 예시

```
🤖 AI Agent Tutorial - Step 1: 기본 대화

당신: 안녕하세요!
AI: 안녕하세요! 무엇을 도와드릴까요?

당신: 오늘 기분이 좋아요
AI: 기분이 좋으시다니 정말 좋네요! ...

당신: quit
대화를 종료합니다. 👋
```

## 🔑 핵심 코드

### Gemini API 초기화
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_AI_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
```

### 스트리밍 응답
```javascript
const result = await model.generateContentStream(input);

for await (const chunk of result.stream) {
  const chunkText = chunk.text();
  process.stdout.write(chunkText);  // 한 글자씩 출력
}
```

## 📌 다음 단계

**Step 2**에서는 **Function Calling**을 통해 날씨 API를 연동합니다.

AI가 외부 도구(API)를 사용하는 방법을 배웁니다! 🌤️
