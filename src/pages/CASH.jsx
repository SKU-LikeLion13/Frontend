// 이 파일은 '수수료 비교&분석' 및 'AI 광고 제작' 탭을 포함하는 메인 페이지 컴포넌트입니다.
// 파일 업로드, 데이터 분석 요청, 그리고 결과 페이지로의 이동을 관리합니다.

// React 및 react-router-dom 라이브러리에서 필요한 기능들을 가져옵니다.
import { useDropzone } from 'react-dropzone';
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useBlocker } from "react-router-dom";
import * as XLSX from 'xlsx'; // 엑셀/CSV 파싱을 위한 xlsx 라이브러리
import { normalizePlatform, processAnalysisData } from "../utils/metrics"; // 유틸리티 함수 임포트

// --- 공통 UI 컴포넌트 ---

// 이름과 상호명을 입력받는 필드 컴포넌트
const InputField = ({ label, value, onChange, ...props }) => (
  <div className="flex items-center justify-between">
    <label className="text-xl font-bold">{label}</label>
    <input
      {...props} // type, name 등 추가적인 input 속성을 받습니다.
      value={value}
      onChange={onChange}
      className="bg-[#1B1B1B] border-b-2 border-gray-600 w-2/3 text-lg text-white focus:outline-none focus:border-[#FF7D29] transition shadow-[inset_0_0_0_1000px_#1B1B1B] [caret-color:white] [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:white] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:white]"
    />
  </div>
);

// 엑셀/CSV 파일 업로드를 위한 드래그 앤 드롭 컴포넌트
const FileUploadField = ({ file, onFileChange }) => {
  // 파일 드롭 시 호출될 콜백 함수
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileChange(acceptedFiles[0]);
    }
  }, [onFileChange]);

  // react-dropzone 훅을 사용하여 드래그 앤 드롭 기능 구현
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
  });

  return (
    <div className="flex items-center justify-between">
      <label className="text-xl font-bold">파일 업로드</label>
      <div
        {...getRootProps()} // 드래그 앤 드롭 영역 속성
        className={`w-2/3 p-4 rounded-full transition-colors cursor-pointer border-2
          ${
            isDragActive ? 'border-orange-500 bg-gray-800' : 'border-[#FF7D29] bg-transparent'
          } flex items-center justify-center gap-3`} // 드래그 활성화 시 스타일 변경
      >
        <input {...getInputProps()} /> {/* 파일 선택 input */}
        {file ? ( // 파일이 선택되었을 경우 파일 이름만 표시
          <span className="font-semibold text-white whitespace-nowrap">
            {file.name}
          </span>
        ) : ( // 파일이 선택되지 않았을 경우 기본 안내 텍스트 표시
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

// '분석하기' 버튼 컴포넌트
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

// '수수료 비교&분석' 탭의 폼 컴포넌트
const FeeAnalysis = ({ onExecute, onFormChange }) => {
  // 폼 데이터 (이름, 상호명, 파일) 상태 관리
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    file: null,
  });

  // 폼 유효성 검사 (모든 필드가 채워져야 유효)
  const isFormValid = !!(formData.name && formData.businessName && formData.file);

  // 입력 필드 값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 파일 변경 핸들러
  const handleFileChange = (file) => {
    setFormData(prev => ({ ...prev, file }));
  };

  // 폼 데이터 변경 시 부모 컴포넌트에 알림 (페이지 이탈 방지용)
  useEffect(() => {
    const isDirty = !!(formData.name || formData.businessName || formData.file);
    onFormChange(isDirty);
  }, [formData, onFormChange]);

  return (
    <div className="w-full flex flex-col items-center text-white mt-12">
      <div className="w-full max-w-md space-y-8">
        <InputField label="이름" type="text" name="name" value={formData.name} onChange={handleChange} />
        <InputField label="상호명" type="text" name="businessName" value={formData.businessName} onChange={handleChange} />
        <FileUploadField file={formData.file} onFileChange={handleFileChange} />
      </div>
      <ExecuteButton onClick={() => onExecute(formData)} disabled={!isFormValid}>
        분석하기
      </ExecuteButton>
    </div>
  );
};

// 데이터 처리 중 표시되는 로딩 화면 컴포넌트
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

// 탭 전환 버튼 컴포넌트
const TabButton = ({ isActive, onClick, children }) => (
  <h2
    onClick={onClick}
    className={`cursor-pointer transition-colors ${
      isActive ? "text-white" : "text-gray-600"
    }`}
  >
    {children}
  </h2>
);

// 'AI 광고 제작' 탭의 플레이스홀더 컴포넌트
const AIPlaceholder = () => (
    <div className="w-full flex flex-col items-center text-center text-gray-500 mt-24">
      <h3 className="text-2xl font-bold">AI 광고 제작 기능 준비 중</h3>
      <p className="mt-4 text-lg">팀원이 열심히 개발하고 있어요. 조금만 기다려주세요!</p>
    </div>
);


// --- 메인 CASH 페이지 컴포넌트 ---
const CASH = ({ initialTab = "ad" }) => {
  // 활성 탭, 로딩 상태, 폼 변경 여부 등 상태 관리
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingName, setLoadingName] = useState("");
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  const navigate = useNavigate(); // 페이지 이동 훅
  const isNavigatingAfterExecute = useRef(false); // 분석 후 페이지 이동 중인지 여부

  // 폼 초기화 함수
  const resetForms = useCallback(() => {
    setIsFormDirty(false);
    setFormResetKey(prev => prev + 1);
  }, []);

  // 페이지 이탈 방지 훅 (작성 중인 내용이 있을 경우 경고)
  useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) => {
        if (isNavigatingAfterExecute.current) return false; // 분석 후 이동 중이면 경고 안함
        if (isFormDirty && activeTab === 'fee' && currentLocation.pathname !== nextLocation.pathname) {
          return !window.confirm(
            "작성중인 내용이 있습니다. 페이지를 이동하시겠습니까? 작성중인 내용은 저장되지 않습니다."
          );
        }
        return false;
      },
      [isFormDirty, activeTab]
    )
  );

  // 탭 전환 핸들러
  const handleTabSwitch = (tab) => {
    if (isFormDirty && activeTab === 'fee') {
      const confirmSwitch = window.confirm(
        "작성중인 내용이 있습니다. 이동하시겠습니까? 작성중인 내용은 저장되지 않습니다."
      );
      if (!confirmSwitch) return;
    }
    setActiveTab(tab);
    resetForms();
  };

  // '수수료 분석' 실행 함수 (파일 파싱 및 데이터 처리)
  const handleFeeExecute = useCallback((formData) => {
    // 1. 파일 유효성 검사
    if (!formData.file) {
      alert("분석할 엑셀/CSV 파일을 업로드해주세요.");
      return;
    }

    // 2. 로딩 상태 설정 및 UI 업데이트
    isNavigatingAfterExecute.current = true;
    setIsLoading(true);
    setLoadingName(formData.name);

    // 3. 파일 읽기 및 파싱
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet); // JSON 형태로 변환

        // 4. 원시 데이터 가공 (날짜 형식 변환, 플랫폼 정규화)
        const rawData = jsonData.map(row => {
          let date = row.date;
          if (typeof date === 'number') { // Excel 날짜 형식(숫자) 처리
            const excelEpoch = new Date(1899, 11, 30);
            const excelDate = new Date(excelEpoch.getTime() + date * 86400000);
            date = excelDate.toISOString().split('T')[0];
          }
          return { ...row, date, platform: normalizePlatform(row.platform) };
        });

        // 5. 중앙화된 데이터 처리 함수 호출 (metrics.js에서 임포트)
        const analysisResult = processAnalysisData(rawData);
        
        // 6. 로딩 해제 및 결과 페이지로 이동
        setTimeout(() => {
          setIsLoading(false);
          resetForms();
          navigate("/chart-result", { state: { analysisResult, name: formData.name } });
          isNavigatingAfterExecute.current = false;
        }, 3000); // 3초 지연 (로딩 화면 보여주기 위함)

      } catch (error) {
        // 파일 처리 중 오류 발생 시
        setIsLoading(false);
        alert(`파일 처리 중 오류가 발생했습니다: ${error.message}`);
        isNavigatingAfterExecute.current = false;
      }
    };
    
    reader.onerror = (error) => {
      // 파일 읽기 중 오류 발생 시
      setIsLoading(false);
      alert(`파일을 읽는 중 오류가 발생했습니다: ${error.message}`);
      isNavigatingAfterExecute.current = false;
    };

    reader.readAsBinaryString(formData.file); // 파일을 이진 문자열로 읽기

  }, [navigate, resetForms]); // 의존성 배열

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1B1B1B] text-white font-sans">
      <div className="relative w-full max-w-5xl bg-[#1B1B1B] border border-orange-500 rounded-xl p-12 flex flex-col mx-4 my-24">
        <div className={`${isLoading ? "filter blur-sm" : ""}`}>
          <div className="flex justify-center items-center gap-8 text-2xl font-bold mb-8">
            <TabButton isActive={activeTab === "ad"} onClick={() => handleTabSwitch("ad")}>
              AI 광고 제작
            </TabButton>
            <span className="text-gray-600">/</span>
            <TabButton isActive={activeTab === "fee"} onClick={() => handleTabSwitch("fee")}>
              수수료 비교&분석
            </TabButton>
          </div>

          {activeTab === "ad" && <AIPlaceholder />}
          
          {activeTab === "fee" && (
            <FeeAnalysis
              key={`fee-form-${formResetKey}`}
              onExecute={handleFeeExecute}
              onFormChange={setIsFormDirty}
            />
          )}
        </div>

        {isLoading && <LoadingScreen name={loadingName} />}
      </div>
    </div>
  );
};

export default CASH;

