import React from 'react'

export default function Header() {
  return (
    <header className="bg-[#1B1B1B] text-white px-6 py-4 relative">
      <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-xl font-bold">
        Adwise
      </div>
      <nav className="flex justify-center items-center h-full">
        <div className="flex space-x-30">
          <a href="#" className="text-gray-300 hover:text-[#FF7D29] hover:font-bold transition-all">
            AI 광고제작
          </a>
          <a href="#" className="text-gray-300 hover:text-[#FF7D29] hover:font-bold transition-all">
            수수료 비교&분석
          </a>
          <a href="#" className="text-gray-300 hover:text-[#FF7D29] hover:font-bold transition-all">
            Contact
          </a>
        </div>
      </nav>
    </header>
  )
}
