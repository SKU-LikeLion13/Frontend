import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function AI() {
  const [selectedTags, setSelectedTags] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [files, setFiles] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const allTags = ["감성적인", "트렌디", "모던", "아늑한", "재밌는", "편안", "핫플", "먹방"];

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    const accepted = picked.filter(
      (f) => f.type === "image/png" || f.type === "image/jpeg" || /\.jfif$/i.test(f.name)
    );
    setFiles(accepted);
  };

  const openConfirm = () => setShowConfirm(true);
  const closeConfirm = () => setShowConfirm(false);

  const confirmProceed = async () => {
    setShowConfirm(false);
    setShowLoading(true);
    try {
      // TODO: Open-Sora API 호출 붙이기
      await new Promise((r) => setTimeout(r, 1500)); // 데모용 딜레이

      const videoUrl = "/sample/placeholder.mp4"; 
      navigate("/ai-result", {
        state: {
          videoUrl,
          meta: { companyName, slogan, selectedTags, fileNames: files.map((f) => f.name) },
        },
      });
    } catch (e) {
      console.error(e);
      alert("영상 생성 중 오류가 발생했어요.");
    } finally {
      setShowLoading(false);
    }
  };

  const tagsText = selectedTags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(", ");

  return (
    <div className="min-h-screen bg-[#1B1B1B] py-10">
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-2 border-[#FF7D29] rounded-lg p-35 bg-[#1B1B1B]">
          <h1 className="text-3xl font-bold text-white text-center mb-12">AI 광고 제작</h1>

          {/* 상호명 */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <label className="text-white text-lg font-medium w-24">상호명</label>
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

          <div className="mb-8">
            <div className="flex items-start mb-4">
              <label className="text-white text-lg font-medium w-24 mt-2">해시태그</label>
              <div className="flex-1">
                <div className="grid grid-cols-4 gap-3">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-[#FF7D29] text-white"
                          : "bg-[#D9D9D9] text-[#1B1B1B] hover:bg-[#B8B8B8]"
                      }`}
                    >
                      {tag.startsWith("#") ? tag : `#${tag}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-start mb-4">
              <label className="text-white text-lg font-medium w-24 mt-2">문구</label>
              <div className="flex-1">
                <textarea
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  rows={3}
                  className="w-full bg-transparent border-b-2 border-gray-600 text-gray-400 py-2 focus:outline-none"
                  placeholder="EX) 연예인도 찾아오는 맛집, 외국인도 놀라고 간 고깃집"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-start mb-4">
              <label className="text-white text-lg font-medium w-24 mt-2">사진 첨부</label>
              <div className="flex-1">
                <div
                  className="flex items-center space-x-4"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  aria-label="파일 첨부"
                >
                  <img src="/img/Group.png" alt="파일 첨부" className="w-10 h-10" />
                  <div className="text-gray-400 text-sm">첨부가능한 파일: PNG, JPG, JFIF</div>
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

          {/* 실행하기 버튼 */}
          <div className="text-center">
            <button
              className="bg-white text-[#1B1B1B] px-7 py-3 rounded-4xl text-lg  hover:bg-[#FF7D29] hover:text-black transition-colors"
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
          <div className="absolute inset-0 bg-black/60" onClick={closeConfirm} />
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
                  <span className="font-bold">선택한 해시태그</span>
                  <span className="text-[#777777] text-right truncate max-w-[70%]">
                    {tagsText || "없음"}
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

      {/* 로딩 모달 */}
      {showLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-[360px] bg-white rounded-2xl shadow-2xl p-8 text-center">
              <p className="text-sm font-bold leading-5">
                {companyName || "@@"} 사장님의
                <br />
                광고를 제작중이에요.
              </p>
              <div className="my-8 flex items-center justify-center">
                <img src="/img/loading.png" alt="Loading" className="w-16 h-16 animate-spin" />
              </div>
              <p className="text-sm font-extrabold">
                잠시만
                <br />
                기다려주세요!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AI;
