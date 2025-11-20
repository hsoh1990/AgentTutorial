/**
 * Step 2: 날씨 API 연동
 * Function Calling을 통한 외부 API 사용
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import readline from 'readline';
import { getWeather, weatherTool } from './weather-api.js';

dotenv.config();

// API 키 확인
const geminiKey = process.env.GOOGLE_AI_KEY;

if (!geminiKey) {
  console.error('❌ GOOGLE_AI_KEY가 .env 파일에 설정되어 있지 않습니다.');
  process.exit(1);
}

// Gemini API 초기화
const genAI = new GoogleGenerativeAI(geminiKey);

// 모델 초기화 (도구 포함)
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  tools: [weatherTool]
});


// readline 인터페이스
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('='.repeat(50));
console.log('🤖 AI Agent Tutorial - Step 2: 날씨 API 연동');
console.log('='.repeat(50));
console.log("종료하려면 'quit', 'exit', 'q' 를 입력하세요.\n");

// 대화 세션 시작
const chat = model.startChat({
  history: []
});

// 대화 함수
async function chatLoop() {
  rl.question('당신: ', async (userInput) => {
    const input = userInput.trim();

    if (['quit', 'exit', 'q'].includes(input.toLowerCase())) {
      console.log('\n대화를 종료합니다. 👋');
      rl.close();
      return;
    }

    if (!input) {
      console.log('메시지를 입력해주세요.\n');
      chatLoop();
      return;
    }

    try {
      // 사용자 메시지 전송
      const result = await chat.sendMessage(input);
      const response = result.response;

      // Function Call이 있는지 확인
      const functionCalls = response.functionCalls();

      if (functionCalls && functionCalls.length > 0) {
        // Function Call 처리
        const functionCall = functionCalls[0];
        console.log(`\n🔧 도구 사용: ${functionCall.name}(${JSON.stringify(functionCall.args)})\n`);

        // 함수 실행
        let functionResult;
        if (functionCall.name === 'getWeather') {
          functionResult = await getWeather(functionCall.args.city);
        }

        // Function 결과를 AI에게 전달하고 스트리밍 응답
        process.stdout.write('AI: ');

        const resultStream = await chat.sendMessageStream([{
          functionResponse: {
            name: functionCall.name,
            response: functionResult
          }
        }]);

        // 스트리밍으로 최종 응답 출력
        for await (const chunk of resultStream.stream) {
          const chunkText = chunk.text();
          process.stdout.write(chunkText);
        }

        console.log('\n');
      } else {
        // 일반 응답 스트리밍
        process.stdout.write('\nAI: ');
        process.stdout.write(response.text());
        console.log('\n');
      }
    } catch (error) {
      console.error(`\n❌ 오류 발생: ${error.message}\n`);
    }

    chatLoop();
  });
}

// 대화 시작
chatLoop();
