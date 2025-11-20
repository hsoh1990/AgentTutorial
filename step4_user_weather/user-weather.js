/**
 * Step 4에서 추가된 기능: 사용자 기반 날씨 조회
 * DB에 저장된 사용자 위치 정보를 기반으로 날씨 정보 제공
 */

import { cityCoordinates, getWeather } from './weather-api.js';
import { getUserLocation } from './db-functions.js';

// 위치에서 도시명 추출
export function extractCity(location) {
  // 정확한 키로 먼저 찾기
  if (cityCoordinates[location]) {
    return location;
  }

  // 포함된 도시 찾기
  for (const city of Object.keys(cityCoordinates)) {
    if (location.includes(city)) {
      return city;
    }
  }

  // 공백으로 분리된 첫 단어 시도
  const firstWord = location.split(' ')[0];
  if (cityCoordinates[firstWord]) {
    return firstWord;
  }

  return null;
}

// 사용자 기반 날씨 조회
export async function getUserWeather(name) {
  try {
    // 1. DB에서 사용자 위치 조회
    const locationResult = getUserLocation(name);

    if (!locationResult.success) {
      return {
        error: `${name}님의 위치 정보를 찾을 수 없습니다. 먼저 위치를 등록해주세요.`
      };
    }

    // 2. 위치에서 도시명 추출
    const city = extractCity(locationResult.location);

    if (!city) {
      return {
        error: `${locationResult.location}에서 지원하는 도시를 찾을 수 없습니다.`
      };
    }

    // 3. 날씨 조회
    const weatherResult = await getWeather(city);

    if (weatherResult.error) {
      return weatherResult;
    }

    // 4. 결합된 결과 반환
    return {
      success: true,
      name,
      location: locationResult.location,
      city: weatherResult.city,
      temperature: weatherResult.temperature,
      humidity: weatherResult.humidity,
      rainfall: weatherResult.rainfall,
      precipType: weatherResult.precipType,
      windSpeed: weatherResult.windSpeed,
      baseTime: weatherResult.baseTime
    };
  } catch (error) {
    return { error: error.message };
  }
}

// Function Declaration (사용자 날씨 도구)
export const userWeatherTool = {
  functionDeclarations: [{
    name: 'getUserWeather',
    description: '등록된 사용자의 위치를 기반으로 날씨 정보를 가져옵니다',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '날씨를 확인할 사용자 이름'
        }
      },
      required: ['name']
    }
  }]
};
