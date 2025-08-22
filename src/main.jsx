import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// 공통 컴포넌트
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

// 병합된 페이지 컴포넌트
import Home from './pages/Home.jsx';
import AI from './pages/AI.jsx';
import AI_RESULT from './pages/AI_RESULT.jsx';
import CASH from './pages/CASH.jsx';
import CHAT from './pages/CHAT.jsx';
import ChartResult from './pages/CHART_RESULT.jsx';

// 세션 관리 유틸리티
import { initSession, startSessionHeartbeat } from './utils/apiClient.js';

// 라우터와 세션 로직을 포함하는 App 컴포넌트
const App = () => {
  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      try { await initSession(); } catch (e) { /* no-op */ }
      if (mounted) startSessionHeartbeat(60 * 1000);
    };
    boot();
    return () => { mounted = false; };
  }, []);

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ai" element={<AI />} />
        <Route path="/ai-result" element={<AI_RESULT />} />
        <Route path="/cash" element={<CASH />} />
        <Route path="/chat" element={<CHAT />} />
        <Route path="/chart-result" element={<ChartResult />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

// 앱 렌더링
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
