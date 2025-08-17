import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import AI from './pages/AI.jsx';
import CASH from './pages/CASH.jsx';
import CHAT from './pages/CHAT.jsx';
import ChartResult from './pages/CHART_RESULT.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ai" element={<AI />} />
        <Route path="/cash" element={<CASH />} />
        <Route path="/chat" element={<CHAT />} />
        <Route path="/chart-result" element={<ChartResult />} /> 
      </Routes>
      <Footer />
    </BrowserRouter>
  </StrictMode>
);
