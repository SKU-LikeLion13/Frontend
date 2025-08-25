import React, { useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

export default function AI_RESULT() {
  const { state } = useLocation() || {};
  const navigate = useNavigate();

  const videoUrl = state?.videoUrl;

  useEffect(() => {
    if (!videoUrl) navigate("/ai", { replace: true });
  }, [videoUrl, navigate]);

  if (!videoUrl) return null;

  return (
    <div className="relative min-h-screen bg-[#1B1B1B] text-white py-10 overflow-hidden">
      <h1 className="ml-[70px] mt-[30px] text-[64px] font-extrabold text-[#FF7D29]">
        Adwise Studio
      </h1>

      <div className="mt-10 flex justify-center">
        <div className="relative w-[min(85vw,280px)] h-[min(70vh,600px)] bg-black rounded-[28px] border-[6px] border-black shadow-2xl overflow-hidden">
          <video
            src={videoUrl}
            controls
            playsInline
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />
        </div>
      </div>

      <div className="mt-8 flex gap-3 justify-center">
        <a
          href={videoUrl}
          download="reels.mp4"
          className="px-4 py-2 rounded-full bg-[#D9D9D9] hover:bg-[#FF7D29] hover:text-white text-black font-semibold"
        >
          저장하기
        </a>
        <Link
          to="/ai"
          className="px-4 py-2 rounded-full bg-[#D9D9D9] hover:bg-[#FF7D29] hover:text-white text-black font-semibold"
        >
          다시 만들기
        </Link>
      </div>
    </div>
  );
}
