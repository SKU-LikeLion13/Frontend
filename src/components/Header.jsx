import React from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-[#1B1B1B] text-white px-6 py-4 relative">
      <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-2xl font-bold">
        <Link to="/" className="text-white hover:text-[#FF7D29] transition-colors">
          Adwise
        </Link>
      </div>
      <nav className="flex justify-center items-center h-full">
        <div className="flex space-x-30">
          <Link to="/ai" className="text-gray-300 hover:text-[#FF7D29] hover:font-bold transition-colors">
            AI 광고제작
          </Link>
          <Link to="/cash" className="text-gray-300 hover:text-[#FF7D29] hover:font-bold transition-colors">
            수수료 비교&분석
          </Link>
          <Link to="/chat" className="text-gray-300 hover:text-[#FF7D29] hover:font-bold transition-colors">
            Contact
          </Link>
        </div>
      </nav>
    </header>
  )
}
