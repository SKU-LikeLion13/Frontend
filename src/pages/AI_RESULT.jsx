import React, { useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

export default function AI_RESULT() {
  const { state } = useLocation() || {};
  const navigate = useNavigate();

  const videoUrl = state?.videoUrl;
  const thumbs = state?.thumbs || [];

  useEffect(() => {
    if (!videoUrl) navigate("/ai", { replace: true });
  }, [videoUrl, navigate]);

  if (!videoUrl) return null;

  return (
    <div className="min-h-screen bg-[#1B1B1B] text-white py-10">
      <div >
        <div className="w-full flex justify-start">
          <h1 className="!text-left ml-[70px] mt-[30px] text-[64px] sm:text-[88px] font-extrabold text-[#FF7D29] leading-none">
            Adwise Studio
          </h1>
        </div>

        <div className="mt-10 flex justify-center">
          <div
            className="
              relative
              w-[min(85vw,280px)] sm:w-[min(80vw,300px)] md:w-[min(70vw,340px)]
              h-[min(70vh,600px)] md:h-[min(70vh,660px)]
              bg-black rounded-[28px] border-[6px] border-black
              shadow-2xl overflow-hidden
            "
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[56px] h-[16px] bg-black rounded-b-2xl z-10" />

            <video
              src={videoUrl}
              controls
              playsInline
              className="absolute inset-0 w-full h-full object-contain bg-black"
              poster="/img/video_poster.png"
            />
          </div>
        </div>

        {/* 썸네일(선택) */}
        {thumbs.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4">
            {thumbs.map((t, i) => (
              <img key={i} src={t} alt={`thumb-${i}`} className="rounded-2xl" />
            ))}
          </div>
        )}
        <div className="mt-8 flex gap-3 justify-center">
          <a
            href={videoUrl}
            download
            className="px-4 py-2 rounded-full bg-[#D9D9D9] hover:bg-[#FF7D29] text-[#1B1B1B] font-semibold">
            저장하기
          </a>
          <Link
            to="/ai"
            className="px-4 py-2 rounded-full bg-[#D9D9D9] text-black hover:bg-[#FF7D29] font-semibold">
            다시 만들기
          </Link>
        </div>
      </div>
    </div>
  );
}
