import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const LoadingScreen = ({ name }) => (
  <div className="absolute inset-0 flex items-center justify-center z-50">
    <div className="bg-white text-black rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-2xl">
      <h2 className="text-3xl font-bold">
        {name ? `${name} 사장님의` : "사장님의"}
        <br />
        광고를 제작 중이에요.
      </h2>
      <div className="my-8 animate-spin">
        <img src="/img/loading.png" alt="Loading" className="w-24 h-24" />
      </div>
      <p className="text-2xl">잠시만 기다려주세요!</p>
    </div>
  </div>
);

function AI() {
  const [companyName, setCompanyName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [files, setFiles] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const anonId =
    localStorage.getItem("anonId") ?? "111e4567-e89b-12d3-a456-426614174000";

  const handlePickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    const accepted = picked.filter(
      (f) =>
        f.type === "image/png" ||
        f.type === "image/jpeg" ||
        /\.jfif$/i.test(f.name)
    );
    setFiles(accepted);
  };

  const openConfirm = () => setShowConfirm(true);
  const closeConfirm = () => setShowConfirm(false);

  const confirmProceed = async () => {
    setShowConfirm(false);
    setShowLoading(true);
    try {
      if (!files.length) {
        alert("이미지를 선택해주세요");
        return;
      }

      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      fd.append("brandName", companyName || "브랜드명 없음");
      if (slogan.trim()) {
        fd.append("prompt", slogan);
      }

      const res = await fetch("/api/creative/reels", {
        method: "POST",
        headers: {
          "X-Anon-Id": anonId,
        },
        body: fd,
      });

      if (!res.ok) {
        alert("업로드 실패: " + (await res.text()));
        return;
      }

      const data = await res.json();
      console.log("✅ downloadUrl 원본:", data.downloadUrl);

      // --- 핵심 로직 ---
      let videoUrl = data.downloadUrl;
      if (videoUrl && !videoUrl.startsWith("/api")) {
        videoUrl = `/api${videoUrl}`;
      }
      console.log("🎬 최종 videoUrl:", videoUrl);

      navigate("/ai-result", {
        state: {
          videoUrl,
          thumbs: files.map((f) => URL.createObjectURL(f)),
          meta: {
            companyName,
            slogan,
            fileNames: files.map((f) => f.name),
          },
        },
      });
    } catch (e) {
      console.error(e);
      alert("영상 생성 중 오류가 발생했어요.");
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1B1B1B] py-10">
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-2 border-[#FF7D29] rounded-lg p-35 bg-[#1B1B1B]">
          <h1 className="text-3xl font-bold text-white text-center mb-12">
            AI 광고 제작
          </h1>

          {/* 상호명 */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <label className="text-white text-lg font-medium w-24">
                상호명
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-gray-600 text-gray-400 py-2 focus:outline-none "
                />
              </div>
            </div>
          </div>

          {/* 문구 */}
          <div className="mb-8">
            <div className="flex items-start mb-4">
              <label className="text-white text-lg font-medium w-24 mt-2">
                문구
              </label>
              <div className="flex-1">
                <textarea
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  rows={3}
                  className="w-full bg-transparent border-b-2 border-gray-600 text-gray-400 py-2 focus:outline-none"
                  placeholder="EX) 줄바꿈으로 각 이미지에 들어갈 문구를 입력하세요."
                />
              </div>
            </div>
          </div>

          {/* 파일 첨부 */}
          <div className="mb-8">
            <div className="flex items-start mb-4">
              <label className="text-white text-lg font-medium w-24 mt-2">
                사진 첨부
              </label>
              <div className="flex-1">
                <div
                  className="flex items-center space-x-4"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  aria-label="파일 첨부"
                >
                  <img
                    src="/img/Group.png"
                    alt="파일 첨부"
                    className="w-10 h-10"
                  />
                  <div className="text-gray-400 text-sm">
                    첨부가능한 파일: PNG, JPG, JFIF, JPEG (최대 8장)
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.jfif,image/png,image/jpeg"
                  multiple
                  className="hidden"
                  onChange={handlePickFiles}
                />

                <div className="border-b-2 border-gray-600 mt-2"></div>
                {files.length > 0 && (
                  <div className="mt-2 text-sm text-gray-300">
                    {files.map((f, idx) => (
                      <div key={idx}>• {f.name}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 실행 버튼 */}
          <div className="text-center">
            <button
              className="bg-white text-[#1B1B1B] px-7 py-3 rounded-4xl text-lg hover:bg-[#FF7D29] hover:text-black transition-colors"
              onClick={openConfirm}
            >
              실행하기
            </button>
          </div>
        </div>
      </div>

      {/* 확인 모달 */}
      {showConfirm && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeConfirm}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-[500px] h-[500px] bg-[#FFFFFF] rounded-2xl shadow-2xl p-8 text-[#1B1B1B] font-bold">
              <h2 className="text-center text-xl font-extrabold leading-7">
                이대로 사장님의
                <br />
                광고를 제작하면 될까요?
              </h2>

              <div className="mt-20 space-y-4 mx-10 text-xl">
                <div className="flex justify-between">
                  <span className="font-bold">상호명</span>
                  <span className="text-[#777777] truncate max-w-[70%]">
                    {companyName || "미입력"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">작성 문구</span>
                  <span className="text-[#777777] text-right truncate max-w-[70%]">
                    {slogan || "미입력"}
                  </span>
                </div>
              </div>

              <div className="mt-20 flex items-center justify-center gap-3">
                <button
                  className="px-4 py-2 rounded-full bg-[#D9D9D9] hover:bg-[#FF7D29] text-gray-800 text-sm"
                  onClick={closeConfirm}
                >
                  조금만 더 생각해볼게요.
                </button>
                <button
                  className="px-4 py-2 rounded-full bg-[#D9D9D9] hover:bg-[#FF7D29] text-black font-semibold text-sm"
                  onClick={confirmProceed}
                >
                  네, 제작해주세요.
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLoading && <LoadingScreen name={companyName} />}
    </div>
  );
}

export default AI;
