import { useDropzone } from "react-dropzone";
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, getOrCreateAnonId } from "../utils/apiClient.js";

// --- 공통 UI 컴포넌트 ---

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

const FileUploadField = ({ file, onFileChange }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) onFileChange(acceptedFiles[0]);
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
        className={`w-2/3 p-4 rounded-full transition-colors cursor-pointer border-2 ${
          isDragActive
            ? "border-orange-500 bg-gray-800"
            : "border-[#FF7D29] bg-transparent"
        } flex items-center justify-center gap-3`}
      >
        <input {...getInputProps()} />
        {file ? (
          <span className="font-semibold text-white whitespace-nowrap">
            {file.name}
          </span>
        ) : (
          <>
            <span className="text-sm font-semibold text-white underline whitespace-nowrap">
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

const FileLoadButton = ({ onClick }) => (
  <div className="flex items-center justify-between">
    <label className="text-xl font-bold">파일 불러오기</label>
    <div
      onClick={onClick}
      className="w-2/3 p-4 rounded-full transition-colors cursor-pointer border-2 border-[#FF7D29] bg-transparent flex items-center justify-center gap-3 hover:bg-gray-800"
    >
      <span className="text-sm font-semibold text-white underline whitespace-nowrap">
        불러오기
      </span>
    </div>
  </div>
);

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

const FeeAnalysis = ({ onExecute }) => {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    file: null,
  });
  const [showRecentFiles, setShowRecentFiles] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loadingRecentFiles, setLoadingRecentFiles] = useState(false);
  const [recentFilesError, setRecentFilesError] = useState(null);

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
    if (showRecentFiles) {
      setShowRecentFiles(false);
      return;
    }

    setShowRecentFiles(true);
    setLoadingRecentFiles(true);
    setRecentFilesError(null);
    try {
      const anonId = getOrCreateAnonId();
      // API 7: 업로드된 파일명 목록 조회
      const { data } = await api.get("/uploads/filenames", {
        params: { anonId, limit: 20 },
      });
      const list = Array.isArray(data.filenames) ? data.filenames : [];
      setRecentFiles(list);
      if (list.length === 0) {
        setRecentFilesError("최근 업로드된 파일이 없습니다.");
      }
    } catch (e) {
      console.error("최근 파일 목록 가져오기 실패:", e);
      setRecentFilesError("최근 파일 목록을 가져오는 데 실패했습니다.");
    } finally {
      setLoadingRecentFiles(false);
    }
  };

  // 파일 선택 시 파일 객체를 상태에 저장하는 기능은 FileUploadField에서 처리하므로
  // 이 함수는 더 이상 필요하지 않습니다.
  // const handleSelectRecentFile = ...

  return (
    <div className="flex flex-col items-center w-full mt-12 text-white">
      <h1 className="text-3xl font-bold text-white pb-15">수수료 비교&분석</h1>
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
        <span className="flex justify-center font-bold bg-[#FF7D29] text-black">예시 엑셀 파일입니다. 행/열을 꼭 맞춰주세요!</span>
        <div className="flex justify-start ml-2">
          <img
            src="/img/realdb.png"
            alt="DB Icon"
            className="object-contain w-150 opacity-80"
          />
        </div>
        <FileLoadButton onClick={handleLoadFile} />
        {showRecentFiles && (
          <div className="bg-[#2D2D2D] p-4 rounded-lg border border-gray-700 mt-4">
            <h4 className="mb-2 text-lg font-bold text-white">
              최근 업로드 파일
            </h4>
            {loadingRecentFiles && (
              <p className="text-gray-400">불러오는 중...</p>
            )}
            {recentFilesError && (
              <p className="text-red-400">{recentFilesError}</p>
            )}
            {!loadingRecentFiles && recentFiles.length > 0 && (
              <ul className="space-y-2">
                {recentFiles.map((filename, index) => (
                  <li
                    key={index}
                    className="text-gray-300"
                    // onClick 제거: 명세에 파일 다운로드 기능이 없으므로 클릭 이벤트를 비활성화합니다.
                  >
                    {filename}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
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

const LoadingScreen = ({ name }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center">
    <div className="flex flex-col items-center justify-center p-12 text-center text-black bg-white shadow-2xl rounded-2xl">
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

  const handleFeeExecute = useCallback(
    async (formData) => {
      if (!formData.file) {
        alert("분석할 파일을 업로드해주세요.");
        return;
      }

      setIsLoading(true);
      setLoadingName(formData.name);

      try {
        const payload = new FormData();
        payload.append("file", formData.file);

        // API 6: 파일 업로드 및 파싱
        const { data } = await api.post("/uploads/parse", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (data.batchId) {
          localStorage.setItem("userName", formData.name);
          navigate("/chart-result", {
            state: { batchId: data.batchId, name: formData.name },
          });
        } else {
          // 서버 응답에 batchId가 없는 경우에 대한 예외 처리
          throw new Error("서버로부터 유효한 batchId를 받지 못했습니다.");
        }
      } catch (error) {
        setIsLoading(false);
        alert(
          `파일 분석 요청 중 오류가 발생했습니다: ${
            error?.response?.data?.message || error.message
          }`
        );
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
