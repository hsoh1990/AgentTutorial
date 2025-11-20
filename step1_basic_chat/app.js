/**
 * Step 1: 기본 대화 Agent
 * Google Gemini API를 사용한 간단한 대화형 AI
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import readline from 'readline';

// 환경 변수 로드
dotenv.config();

// API 키 확인
const apiKey = process.env.GOOGLE_AI_KEY;
if (!apiKey) {
  console.error('❌ GOOGLE_AI_KEY가 .env 파일에 설정되어 있지 않습니다.');
  process.exit(1);
}

// Gemini API 초기화
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// readline 인터페이스 설정
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('='.repeat(50));
console.log('🤖 AI Agent Tutorial - Step 1: 기본 대화');
console.log('='.repeat(50));
console.log("종료하려면 'quit', 'exit', 'q' 를 입력하세요.\n");

// 대화 함수
async function chat() {
  rl.question('당신: ', async (userInput) => {
    const input = userInput.trim();

    // 종료 명령어 처리
    if (['quit', 'exit', 'q'].includes(input.toLowerCase())) {
      console.log('\n대화를 종료합니다. 👋');
      rl.close();
      return;
    }

    // 빈 입력 체크
    if (!input) {
      console.log('메시지를 입력해주세요.\n');
      chat();
      return;
    }

    try {
      // Gemini API 스트리밍 호출
      process.stdout.write('\nAI: ');

      const result = await model.generateContentStream(input);

      // 스트리밍으로 응답 출력 (한 글자씩)
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        process.stdout.write(chunkText);
      }

      console.log('\n');
    } catch (error) {
      console.error(`\n❌ 오류 발생: ${error.message}\n`);
    }

    // 다음 입력 대기
    chat();
  });
}

// 대화 시작
chat();
