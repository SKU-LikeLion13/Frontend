// --- CASH 페이지 메인 컴포넌트 ---
// 이 파일은 '수수료 비교&분석' 탭을 포함하는 메인 페이지 컴포넌트임.
// 주요 기능:
// 1. 이름/상호명 입력 및 엑셀/CSV 파일 업로드
// 2. 업로드된 파일을 읽어 JSON으로 변환
// 3. 데이터 전처리(날짜 변환, 플랫폼 정규화 등)
// 4. 분석 결과를 metrics.js의 processAnalysisData로 처리
// 5. 결과 페이지("/chart-result")로 이동
// 6. 작성 중인 폼 내용이 있는 경우 페이지 이탈 경고 표시

import { useDropzone } from "react-dropzone";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useBlocker } from "react-router-dom";
import * as XLSX from "xlsx"; // 엑셀/CSV 파싱용 라이브러리
import { normalizePlatform, processAnalysisData } from "../utils/metrics"; // 데이터 처리 유틸리티

// --- 공통 UI 컴포넌트 ---

// 이름과 상호명 입력 필드 컴포넌트
const InputField = ({ label, value, onChange, ...props }) => (
  <div className="flex items-center justify-between">
    <label className="text-xl font-bold">{label}</label>
    <input
      {...props} // type, name 등 추가 속성
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
const FeeAnalysis = ({ onExecute, onFormChange }) => {
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

  // 폼 변경 시 부모 컴포넌트에 알림 (페이지 이탈 방지용)
  useEffect(() => {
    const isDirty = !!(formData.name || formData.businessName || formData.file);
    onFormChange(isDirty);
  }, [formData, onFormChange]);

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
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  const navigate = useNavigate();
  const isNavigatingAfterExecute = useRef(false); // 분석 후 페이지 이동 중인지 여부

  const resetForms = useCallback(() => {
    setIsFormDirty(false);
    setFormResetKey((prev) => prev + 1);
  }, []);

  // 페이지 이탈 경고
  useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) => {
        if (isNavigatingAfterExecute.current) return false; // 분석 후 이동 중이면 경고 안함
        if (isFormDirty && currentLocation.pathname !== nextLocation.pathname) {
          return !window.confirm(
            "작성중인 내용이 있습니다. 페이지를 이동하시겠습니까? 작성중인 내용은 저장되지 않습니다."
          );
        }
        return false;
      },
      [isFormDirty]
    )
  );

  // 수수료 분석 실행 함수
  const handleFeeExecute = useCallback(
    (formData) => {
      if (!formData.file) {
        alert("분석할 엑셀/CSV 파일을 업로드해주세요.");
        return;
      }

      isNavigatingAfterExecute.current = true;
      setIsLoading(true);
      setLoadingName(formData.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const rawData = jsonData.map((row) => {
            let date = row.date;
            if (typeof date === "number") {
              const excelEpoch = new Date(1899, 11, 30);
              const excelDate = new Date(
                excelEpoch.getTime() + date * 86400000
              );
              date = excelDate.toISOString().split("T")[0];
            }
            return { ...row, date, platform: normalizePlatform(row.platform) };
          });

          const analysisResult = processAnalysisData(rawData);

          setTimeout(() => {
            setIsLoading(false);
            resetForms();
            navigate("/chart-result", {
              state: { analysisResult, name: formData.name },
            });
            isNavigatingAfterExecute.current = false;
          }, 3000);
        } catch (error) {
          setIsLoading(false);
          alert(`파일 처리 중 오류가 발생했습니다: ${error.message}`);
          isNavigatingAfterExecute.current = false;
        }
      };

      reader.onerror = (error) => {
        setIsLoading(false);
        alert(`파일을 읽는 중 오류가 발생했습니다: ${error.message}`);
        isNavigatingAfterExecute.current = false;
      };

      reader.readAsBinaryString(formData.file);
    },
    [navigate, resetForms]
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1B1B1B] text-white font-sans">
      <div className="relative w-full max-w-5xl bg-[#1B1B1B] border border-orange-500 rounded-xl p-12 flex flex-col mx-4 my-24">
        <div className={`${isLoading ? "filter blur-sm" : ""}`}>
          <FeeAnalysis
            key={`fee-form-${formResetKey}`}
            onExecute={handleFeeExecute}
            onFormChange={setIsFormDirty}
          />
        </div>

        {isLoading && <LoadingScreen name={loadingName} />}
      </div>
    </div>
  );
};

export default CASH;
