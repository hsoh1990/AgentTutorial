/**
 * Step 4: 사용자 기반 날씨 조회 (완성본)
 * DB와 API를 통합한 완전한 AI Agent
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import readline from 'readline';
import { getWeather, weatherTool } from './weather-api.js';
import { db, saveUserLocation, getUserLocation, listAllUsers, dbTools } from './db-functions.js';
import { getUserWeather, userWeatherTool } from './user-weather.js';

dotenv.config();

// API 키 확인
const geminiKey = process.env.GOOGLE_AI_KEY;

if (!geminiKey) {
  console.error('❌ API 키가 설정되어 있지 않습니다.');
  process.exit(1);
}

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
    case 'getUserWeather':
      return await getUserWeather(args.name);
    default:
      return { error: '알 수 없는 함수입니다.' };
  }
}

// Gemini API 초기화
const genAI = new GoogleGenerativeAI(geminiKey);

// Function Declarations (모든 도구 통합)
const tools = {
  functionDeclarations: [
    ...weatherTool.functionDeclarations,
    ...dbTools.functionDeclarations,
    ...userWeatherTool.functionDeclarations
  ]
};

const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  tools: [tools]
});

// readline 인터페이스
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('='.repeat(60));
console.log('🤖 AI Agent Tutorial - Step 4: 완성된 Agent');
console.log('='.repeat(60));
console.log("종료하려면 'quit', 'exit', 'q' 를 입력하세요.");
console.log("\n💡 사용 예시:");
console.log("  - 오형석는 대전에 살아");
console.log("  - 오형석 날씨 알려줘  ← 핵심 기능!");
console.log("  - 서울 날씨 알려줘");
console.log("  - 등록된 사람들 보여줘\n");

const chat = model.startChat({ history: [] });

// 대화 루프
async function chatLoop() {
  rl.question('당신: ', async (userInput) => {
    const input = userInput.trim();

    if (['quit', 'exit', 'q'].includes(input.toLowerCase())) {
      console.log('\n대화를 종료합니다. 👋');
      db.close();
      rl.close();
      return;
    }

    if (!input) {
      console.log('메시지를 입력해주세요.\n');
      chatLoop();
      return;
    }

    try {
      const result = await chat.sendMessage(input);
      const response = result.response;
      const functionCalls = response.functionCalls();

      if (functionCalls && functionCalls.length > 0) {
        const functionCall = functionCalls[0];
        console.log(`\n🔧 도구 사용: ${functionCall.name}(${JSON.stringify(functionCall.args)})\n`);

        const functionResult = await executeFunction(functionCall);

        // 결과를 AI에게 전달하고 스트리밍 응답
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

chatLoop();
