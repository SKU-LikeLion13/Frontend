import React, { useState, useRef } from 'react';

function AI() {
  const [selectedTags, setSelectedTags] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [files, setFiles] = useState([]);     
  const fileInputRef = useRef(null);

  const allTags = ['감성적인', '트렌디', '모던', '아늑한', '재밌는', '편안', '핫플', '먹방'];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handlePickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    const accepted = picked.filter(f =>
      f.type === 'image/png' ||
      f.type === 'image/jpeg' ||
      /\.jfif$/i.test(f.name)
    );
    setFiles(accepted);
  };

  return (
    <div className="min-h-screen bg-[#1B1B1B] py-10">
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-2 border-[#FF7D29] rounded-lg p-35 bg-[#1B1B1B]">
          <h1 className="text-3xl font-bold text-white text-center mb-12">
            AI 광고 제작
          </h1>

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
                          ? 'bg-[#FF7D29] text-white'
                          : 'bg-[#D9D9D9] text-[#1B1B1B] hover:bg-[#B8B8B8]'
                      }`} >
                      {tag.startsWith('#') ? tag : `#${tag}`}
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
                  <div className="text-gray-400 text-sm">
                    첨부가능한 파일: PNG, JPG, JFIF 
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
          <div className="text-center">
            <button className="bg-white text-[#1B1B1B] px-7 py-3 rounded-4xl text-lg  hover:bg-[#FF7D29] hover:text-black transition-colors">
              실행하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AI;