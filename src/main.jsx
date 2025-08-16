import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import CASH from './pages/CASH.jsx'
import AIPlaceholder from './pages/AI.jsx'
import CHAT from './pages/CHAT.jsx'
import ChartResult from './pages/CHART_RESULT.jsx' // ChartResult 컴포넌트 임포트

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Header />
        <Home />
        <Footer />
      </>
    ),
  },
  {
    path: "/ai",
    element: (
      <>
        <Header />
        <AIPlaceholder />
        <Footer />
      </>
    ),
  },
  {
    path: "/cash",
    element: (
      <>
        <Header />
        <CASH key="fee" />
        <Footer />
      </>
    ),
  },
  {
    path: "/chat",
    element: (
      <>
        <Header />
        <CHAT />
        <Footer />
      </>
    ),
  },
  {
    path: "/chart-result",
    element: (
      <>
        <Header />
        <ChartResult />
        <Footer />
      </>
    ),
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

