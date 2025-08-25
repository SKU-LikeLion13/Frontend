import axios from "axios";

// 익명 세션 ID 관리
const STORAGE_KEY = "anonId";

export const getOrCreateAnonId = () => {
  let anonId = localStorage.getItem(STORAGE_KEY);
  if (!anonId) {
    // If no anonId exists, use the user's specified default
    anonId = "TK";
    localStorage.setItem(STORAGE_KEY, anonId); // Store this default ID
  }
  return anonId;
};

// 공용 axios 인스턴스
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api", // 👉 프록시 경로 사용
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// 요청 인터셉터: X-Anon-Id 자동 첨부
api.interceptors.request.use((config) => {
  const anonId = getOrCreateAnonId();
  config.headers = config.headers || {};
  config.headers["X-Anon-Id"] = anonId;
  return config;
});

// 세션 API
export const initSession = async () => {
  const { data } = await api.get("/sessions/me");
  return data;
};

let heartbeatTimerId = null;

export const startSessionHeartbeat = (intervalMs = 60000) => {
  if (heartbeatTimerId) return heartbeatTimerId;
  heartbeatTimerId = setInterval(() => {
    api.post("/sessions/me/touch").catch(() => {});
  }, intervalMs);

  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
      // try {
      // navigator.sendBeacon?.(`/api/sessions/me/touch`);
      // } catch (e) {
      // }
    });
  }
  return heartbeatTimerId;
};

export const stopSessionHeartbeat = () => {
  if (heartbeatTimerId) {
    clearInterval(heartbeatTimerId);
    heartbeatTimerId = null;
  }
};


// --- 레거시 코드 ---
// 아래 코드는 원래 다른 파일에 있었으나, API 클라이언트와 밀접한 관련이 있어 이 파일로 통합되었습니다.
// 향후 리팩토링을 통해 더 나은 구조로 개선될 수 있습니다.

// 채팅 메시지 전송
export const sendMessage = async (message, history) => {
  const { data } = await api.post('/chat/send', { message, history })
  return data
}

// 채팅 기록 가져오기
export const getHistory = async () => {
  const { data } = await api.get('/chat/history')
  return data
}

// 채팅 기록 삭제
export const deleteHistory = async () => {
  const { data } = await api.delete('/chat/history')
  return data
}

// AI 분석 요청
export const requestAiAnalysis = async (target, context) => {
  const { data } = await api.post('/ai/request', { target, context })
  return data
}

// AI 분석 결과 가져오기
export const getAiAnalysis = async (id) => {
  const { data } = await api.get(`/ai/result/${id}`)
  return data
}