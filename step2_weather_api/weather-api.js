/**
 * Step 2에서 추가된 기능: 날씨 API 연동
 * 기상청 단기예보 API를 통한 실시간 날씨 정보 조회
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// 기상청 API 키
const kmaKey = process.env.KMA_API_KEY;

if (!kmaKey) {
  console.error('❌ KMA_API_KEY가 .env 파일에 설정되어 있지 않습니다.');
  console.error('https://www.data.go.kr/data/15084084/openapi.do 에서 API 키를 발급받으세요.');
  process.exit(1);
}

// 주요 도시 격자 좌표 (기상청 격자 좌표)
export const cityCoordinates = {
  '서울': { nx: 60, ny: 127, name: '서울' },
  'Seoul': { nx: 60, ny: 127, name: '서울' },
  '부산': { nx: 98, ny: 76, name: '부산' },
  'Busan': { nx: 98, ny: 76, name: '부산' },
  '대구': { nx: 89, ny: 90, name: '대구' },
  'Daegu': { nx: 89, ny: 90, name: '대구' },
  '인천': { nx: 55, ny: 124, name: '인천' },
  'Incheon': { nx: 55, ny: 124, name: '인천' },
  '광주': { nx: 58, ny: 74, name: '광주' },
  'Gwangju': { nx: 58, ny: 74, name: '광주' },
  '대전': { nx: 67, ny: 100, name: '대전' },
  'Daejeon': { nx: 67, ny: 100, name: '대전' },
  '울산': { nx: 102, ny: 84, name: '울산' },
  'Ulsan': { nx: 102, ny: 84, name: '울산' },
  '세종': { nx: 66, ny: 103, name: '세종' },
  'Sejong': { nx: 66, ny: 103, name: '세종' },
  '수원': { nx: 60, ny: 121, name: '수원' },
  'Suwon': { nx: 60, ny: 121, name: '수원' },
  '제주': { nx: 52, ny: 38, name: '제주' },
  'Jeju': { nx: 52, ny: 38, name: '제주' }
};

// 발표 시각 계산 (기상청은 매시 30분에 발표)
export function getBaseDateTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // 현재 시각이 30분 이전이면 이전 시각 사용
  let baseHour = minutes < 30 ? hours - 1 : hours;
  if (baseHour < 0) baseHour = 23;

  const baseDate = now.toISOString().slice(0, 10).replace(/-/g, '');
  const baseTime = String(baseHour).padStart(2, '0') + '00';

  return { baseDate, baseTime };
}

// 실제 날씨 조회 함수 (기상청 단기예보 API)
export async function getWeather(city) {
  try {
    // 도시 좌표 찾기
    const coords = cityCoordinates[city];
    if (!coords) {
      return {
        error: `${city}는 지원하지 않는 도시입니다. 지원 도시: 서울, 부산, 대구, 인천, 광주, 대전, 울산, 세종, 수원, 제주`
      };
    }

    const { baseDate, baseTime } = getBaseDateTime();

    // 기상청 초단기실황 API 호출
    const url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
    const params = {
      serviceKey: kmaKey,
      numOfRows: 10,
      pageNo: 1,
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx: coords.nx,
      ny: coords.ny
    };

    const response = await axios.get(url, { params });
    const items = response.data.response?.body?.items?.item;

    if (!items || items.length === 0) {
      return { error: '날씨 데이터를 가져올 수 없습니다.' };
    }

    // 데이터 파싱
    const weatherData = {};
    items.forEach(item => {
      weatherData[item.category] = item.obsrValue;
    });

    // T1H: 기온, REH: 습도, RN1: 1시간 강수량, PTY: 강수형태, WSD: 풍속
    const temperature = weatherData.T1H || 'N/A';
    const humidity = weatherData.REH || 'N/A';
    const rainfall = weatherData.RN1 || '0';
    const precipType = weatherData.PTY || '0';
    const windSpeed = weatherData.WSD || 'N/A';

    // 강수 형태 해석
    const precipTypeText = {
      '0': '없음',
      '1': '비',
      '2': '비/눈',
      '3': '눈',
      '4': '소나기'
    };

    return {
      city: coords.name,
      temperature: `${temperature}°C`,
      humidity: `${humidity}%`,
      rainfall: `${rainfall}mm`,
      precipType: precipTypeText[precipType] || '없음',
      windSpeed: `${windSpeed}m/s`,
      baseTime: `${baseDate} ${baseTime}`
    };
  } catch (error) {
    return { error: `날씨 정보를 가져올 수 없습니다: ${error.message}` };
  }
}

// Function Declaration 정의
export const weatherTool = {
  functionDeclarations: [{
    name: 'getWeather',
    description: '특정 도시의 현재 날씨 정보를 가져옵니다 (지원 도시: 서울, 부산, 대구, 인천, 광주, 대전, 울산, 세종, 수원, 제주)',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: '날씨를 조회할 도시 이름 (한글 또는 영문, 예: 서울, Seoul, 부산, Busan)'
        }
      },
      required: ['city']
    }
  }]
};
