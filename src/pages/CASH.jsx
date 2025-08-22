import { useDropzone } from "react-dropzone";
import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { normalizePlatform, processAnalysisData } from "../utils/metrics"; // 데이터 처리 유틸리티
import { api, getOrCreateAnonId } from "../utils/apiClient.js";

// --- 공통 UI 컴포넌트 ---

// 이름과 상호명 입력 필드 컴포넌트
const InputField = ({ label, value, onChange, ...props }) => (
  <div className="flex items-center justify-between">
    <label className="text-xl font-bold">{label}</label>
    <input
      {...props}
      value={value}
      onChange={onChange}
      className="bg-[#1B1B1B] border-b-2 border-gray-600 w-2/3 text-lg text-white focus:outline-none focus:border-[#FF7D29] transition shadow-[inset_0_0_0_1000px_#1B1B1B] [caret-color:white] [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white]"
    />
  </div>
);

// 파일 업로드 드래그 앤 드롭 컴포넌트
const FileUploadField = ({ file, onFileChange }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileChange(acceptedFiles[0]); // 첫 번째 파일 선택
      }
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
  });

  return (
    <div className="flex items-center justify-between">
      <label className="text-xl font-bold">파일 업로드</label>
      <div
        {...getRootProps()}
        className={`w-2/3 p-4 rounded-full transition-colors cursor-pointer border-2
          ${
            isDragActive
              ? "border-orange-500 bg-gray-800"
              : "border-[#FF7D29] bg-transparent"
          }
          flex items-center justify-center gap-3`}
      >
        <input {...getInputProps()} />
        {file ? (
          <span className="font-semibold text-white whitespace-nowrap">
            {file.name}
          </span>
        ) : (
          <>
            <span className="font-semibold text-sm text-white underline whitespace-nowrap">
              파일 선택
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              또는 여기로 파일을 끌어오세요.
            </span>
          </>
        )}
      </div>
    </div>
  );
};

// 파일 불러오기 버튼 컴포넌트
const FileLoadButton = ({ onClick }) => (
  <div className="flex items-center justify-between">
    <label className="text-xl font-bold">파일 불러오기</label>
    <div
      onClick={onClick}
      className="w-2/3 p-4 rounded-full transition-colors cursor-pointer border-2 border-[#FF7D29] bg-transparent flex items-center justify-center gap-3 hover:bg-gray-800"
    >
      <span className="font-semibold text-sm text-white underline whitespace-nowrap">
        불러오기
      </span>
    </div>
  </div>
);

// 분석 실행 버튼
const ExecuteButton = ({ onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`mt-20 py-3 px-12 rounded-full text-xl font-bold transition-colors ${
      disabled
        ? "bg-zinc-700 text-gray-500 cursor-not-allowed"
        : "bg-[#FF7D29] text-black"
    }`}
  >
    {children}
  </button>
);

// '수수료 비교&분석' 폼 컴포넌트
const FeeAnalysis = ({ onExecute }) => {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    file: null,
  });

  // 모든 필드가 채워져야 버튼 활성화
  const isFormValid = !!(
    formData.name &&
    formData.businessName &&
    formData.file
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file) => setFormData((prev) => ({ ...prev, file }));

  const handleLoadFile = async () => {
    try {
      const anonId = getOrCreateAnonId();
      const { data } = await api.get('/api/uploads/filenames', {
        params: { anonId, limit: 20 },
      });
      const list = Array.isArray(data) ? data : (data?.filenames || []);
      if (list.length === 0) {
        alert('최근 업로드된 파일이 없습니다.');
        return;
      }
      alert(`최근 파일 목록\n\n${list.map((n, i) => `${i + 1}. ${n}`).join('\n')}`);
    } catch (e) {
      console.error(e);
      alert('최근 파일 목록을 가져오지 못했습니다.');
    }
  };

  return (
    <div className="w-full flex flex-col items-center text-white mt-12">
      <h1 className="text-white text-3xl font-bold pb-15">수수료 비교&분석</h1>
      <div className="w-full max-w-md space-y-8">
        <InputField
          label="이름"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        <InputField
          label="상호명"
          type="text"
          name="businessName"
          value={formData.businessName}
          onChange={handleChange}
        />
        <FileUploadField file={formData.file} onFileChange={handleFileChange} />
        <FileLoadButton onClick={handleLoadFile} />
      </div>
      <ExecuteButton
        onClick={() => onExecute(formData)}
        disabled={!isFormValid}
      >
        분석하기
      </ExecuteButton>
    </div>
  );
};

// 로딩 화면 컴포넌트
const LoadingScreen = ({ name }) => (
  <div className="absolute inset-0 flex items-center justify-center z-50">
    <div className="bg-white text-black rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-2xl">
      <h2 className="text-3xl font-bold">
        {name ? `${name} 사장님의` : "사장님의"}
        <br />
        데이터를 분석하고 있어요.
      </h2>
      <div className="my-8 animate-spin">
        <img src="/img/loading.png" alt="Loading" className="w-24 h-24" />
      </div>
      <p className="text-2xl">잠시만 기다려주세요!</p>
    </div>
  </div>
);

// --- 메인 CASH 페이지 ---
const CASH = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingName, setLoadingName] = useState("");

  const navigate = useNavigate();
  const isNavigatingAfterExecute = useRef(false);

  // 수수료 분석 실행 함수
  const handleFeeExecute = useCallback(
    async (formData) => {
      if (!formData.file) {
        alert("분석할 엑셀/CSV 파일을 업로드해주세요.");
        return;
      }

      isNavigatingAfterExecute.current = true;
      setIsLoading(true);
      setLoadingName(formData.name);

      const startTime = Date.now();
      const minLoadingTime = 1500;

      try {
        const payload = new FormData();
        payload.append('file', formData.file);

        const { data } = await api.post('/api/uploads/parse', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // 유연한 응답 처리: 서버가 analysisResult 또는 rows/rawData를 반환할 수 있음
        let analysisResult = null;
        if (data?.analysisResult) {
          analysisResult = data.analysisResult;
        } else {
          const rows = Array.isArray(data)
            ? data
            : (data?.rows || data?.rawData || data?.data || []);
          const normalizedRows = rows.map((row) => {
            let date = row.date;
            if (typeof date === 'number') {
              const excelEpoch = new Date(1899, 11, 30);
              const excelDate = new Date(excelEpoch.getTime() + date * 86400000);
              date = excelDate.toISOString().split('T')[0];
            }
            return { ...row, date, platform: normalizePlatform(row.platform) };
          });
          analysisResult = processAnalysisData(normalizedRows);
        }

        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, minLoadingTime - elapsed);

        setTimeout(() => {
          setIsLoading(false);
          localStorage.setItem("analysisResult", JSON.stringify(analysisResult));
          localStorage.setItem("userName", formData.name);
          navigate("/chart-result", { state: { analysisResult, name: formData.name } });
          isNavigatingAfterExecute.current = false;
        }, delay);
      } catch (error) {
        setIsLoading(false);
        alert(`파일 업로드/파싱 중 오류가 발생했습니다: ${error?.response?.data?.message || error.message}`);
        isNavigatingAfterExecute.current = false;
      }
    },
    [navigate]
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1B1B1B] text-white font-sans">
      <div className="relative w-full max-w-5xl bg-[#1B1B1B] border border-orange-500 rounded-xl p-12 flex flex-col mx-4 my-24">
        <div className={`${isLoading ? "filter blur-sm" : ""}`}>
          <FeeAnalysis onExecute={handleFeeExecute} />
        </div>

        {isLoading && <LoadingScreen name={loadingName} />}
      </div>
    </div>
  );
};

export default CASH;