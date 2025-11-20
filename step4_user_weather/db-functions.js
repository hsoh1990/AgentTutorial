/**
 * Step 3에서 추가된 기능: Database 통합
 * SQLite를 통한 사용자 위치 저장 및 조회
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 현재 디렉토리 경로
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// SQLite 데이터베이스 초기화
export const db = new Database(join(__dirname, 'users.db'));

// 테이블 생성
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 사용자 위치 저장
export function saveUserLocation(name, location) {
  try {
    const stmt = db.prepare('INSERT OR REPLACE INTO users (name, location) VALUES (?, ?)');
    stmt.run(name, location);
    return { success: true, message: `${name}님의 위치를 ${location}로 저장했습니다.` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 사용자 위치 조회
export function getUserLocation(name) {
  try {
    const stmt = db.prepare('SELECT location FROM users WHERE name = ?');
    const result = stmt.get(name);

    if (result) {
      return { success: true, name, location: result.location };
    } else {
      return { success: false, message: `${name}님의 정보를 찾을 수 없습니다.` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 전체 사용자 목록
export function listAllUsers() {
  try {
    const stmt = db.prepare('SELECT name, location FROM users ORDER BY created_at DESC');
    const users = stmt.all();

    if (users.length === 0) {
      return { success: true, users: [], message: '등록된 사용자가 없습니다.' };
    }

    return { success: true, users };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Function Declarations (DB 도구)
export const dbTools = {
  functionDeclarations: [
    {
      name: 'saveUserLocation',
      description: '사용자의 이름과 거주 위치를 데이터베이스에 저장합니다',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: '사용자 이름'
          },
          location: {
            type: 'string',
            description: '거주 위치 (예: 대전 동구, 서울 강남구)'
          }
        },
        required: ['name', 'location']
      }
    },
    {
      name: 'getUserLocation',
      description: '특정 사용자의 거주 위치를 데이터베이스에서 조회합니다',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: '조회할 사용자 이름'
          }
        },
        required: ['name']
      }
    },
    {
      name: 'listAllUsers',
      description: '데이터베이스에 등록된 모든 사용자와 위치를 조회합니다',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  ]
};
