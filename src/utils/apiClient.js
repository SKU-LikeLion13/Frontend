import axios from 'axios'

// 익명 세션 ID 관리
const STORAGE_KEY = 'anonymousId'

export const getOrCreateAnonId = () => {
  let anonId = localStorage.getItem(STORAGE_KEY)
  if (!anonId) {
    try {
      anonId = crypto.randomUUID()
    } catch (e) {
      const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
      anonId = `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`
    }
    localStorage.setItem(STORAGE_KEY, anonId)
  }
  return anonId
}

// 공용 axios 인스턴스
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

// 요청 인터셉터: X-Anon-Id 자동 첨부
api.interceptors.request.use((config) => {
  const anonId = getOrCreateAnonId()
  config.headers = config.headers || {}
  config.headers['X-Anon-Id'] = anonId
  return config
})

// 세션 API
export const initSession = async () => {
  const { data } = await api.get('/api/sessions/me')
  return data
}

let heartbeatTimerId = null

export const startSessionHeartbeat = (intervalMs = 60000) => {
  if (heartbeatTimerId) return heartbeatTimerId
  heartbeatTimerId = setInterval(() => {
    api.post('/api/sessions/me/touch').catch(() => {})
  }, intervalMs)
  // 브라우저 종료 전에 한 번 더 기록 시도
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      try { navigator.sendBeacon?.(`${import.meta.env.VITE_API_BASE_URL}/api/sessions/me/touch`) } catch (e) {}
    })
  }
  return heartbeatTimerId
}

export const stopSessionHeartbeat = () => {
  if (heartbeatTimerId) {
    clearInterval(heartbeatTimerId)
    heartbeatTimerId = null
  }
}




