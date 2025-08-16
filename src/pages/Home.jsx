import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="bg-[#1B1B1B]">
      <div className="min-h-screen bg-[#1B1B1B] relative">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[url('/img/home.png')] opacity-80" />
        <div className="relative z-10 flex flex-col items-start justify-center min-h-screen text-white px-6">
          <div className="text-start">
            <h1 className="relative text-6xl text-[157px] font-bold text-[#FF7D29] mb-8 ml-[50px]">
              <span className="absolute -top-5 -left-8 text-[#FF7D29] opacity-10">Convenient</span>
              <span className="absolute bottom-5 -left-5 text-[#FF7D29] opacity-10">Adwise</span>
              <span className="relative z-10">Convenient</span><br />
              <span className="relative z-10">Adwise</span>
            </h1>
            
            <div className="ml-[50px] space-y-2">
              <p className="text-white text-xl font-thin">복잡한 광고는 AI로</p>
              <p className="text-white text-xl font-thin ml-10">수수료 비교는 차트로</p>
            </div>
            
            <div className="ml-[50px] mt-[100px] space-y-2">
              <p className="text-white text-xl font-thin">광고는 AI가 대신하고, </p>
              <p className="text-white text-xl font-thin">수수료는 차트로 비교해드립니다. </p>
              <div className="w-[1300px] h-px bg-white mt-7"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1B1B1B] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-center">
              <div className="w-160 h-130 transform  ">
                <img src="/img/Phone1.png" alt="목업 1" 
                  className="w-full h-full object-cover rounded-3xl"/>
              </div>
            </div>
            <div className="flex-1 max-w-2xl">
              <h2 className="text-5xl font-bold text-white mb-6 space-y-4">
                <span className="text-white ml-22 block">"광고 이제</span>
                <div className="flex items-center">
                  <p className="text-[#FF7D29]">직접 만들지마세요</p>
                  <span className="text-white">"</span>
                </div>
              </h2>

              <div className="space-y-2 text-gray-300 text-lg mb-8 mt-10">
                <p>"클릭 몇 번이면 AI가 알아서 광고를 제작해드립니다."</p>
                <p className='ml-5'>"네이버/메타(페이스북,인스타그램)/구글 동시에 <br /></p>
                <p className='ml-32'>최적화됩니다."</p>
              </div>
              <Link 
                to="/ai" 
                className="inline-block ml-30 bg-[#8D8D8D] text-white px-9 py-3 rounded-lg hover:bg-[#FF7D29] transition-colors  text-lg">
                바로가기
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-[#1B1B1B] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-start justify-between mb-12">
            <div className="flex-1 max-w-2xl">
              <h2 className="text-5xl font-bold text-white mb-6 space-y-4">
                <div className="flex items-center">
                  <span className="text-white ml-25">"</span>
                  <span className="text-[#FF7D29]"> 광고 수수료</span>
                  <span className="text-white">.</span>
                </div>
                <div className="ml-20">얼마나 나가는지</div>
                <div className="ml-20">알고 계시나요?"</div>
              </h2>
            </div>
            
            <div className="flex-1 text-center">
              <div className="space-y-4">
                <div className="space-y-2 text-white text-lg">
                  <p>"Adwise는 플랫폼별 수수료를 한눈에 비교해서,</p>
                  <p>가장 효율적인 광고 전략을 제시합니다."</p>
                </div>
                
                <Link 
                  to="/cash" 
                  className="inline-block bg-[#8D8D8D] text-white px-9 py-3 rounded-lg hover:bg-[#FF7D29] transition-colors text-lg">
                  바로가기
                </Link>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="w-160">
              <img src="/img/Phone2.png" alt="목업 2" 
                className="w-full h-full object-cover rounded-3xl"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}