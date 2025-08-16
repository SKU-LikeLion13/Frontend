import { useDropzone } from 'react-dropzone';
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx'; 
import { normalizePlatform, processAnalysisData } from "../utils/metrics";

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
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileChange(acceptedFiles[0]);
    }
  }, [onFileChange]);

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
        {...getRootProps()}
        className={`w-2/3 p-4 rounded-full transition-colors cursor-pointer border-2
          ${
            isDragActive ? 'border-orange-500 bg-gray-800' : 'border-[#FF7D29] bg-transparent'
          } flex items-center justify-center gap-3`} 
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

const FeeAnalysis = ({ onExecute, onFormChange }) => {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    file: null,
  });

  const isFormValid = !!(formData.name && formData.businessName && formData.file);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file) => {
    setFormData(prev => ({ ...prev, file }));
  };

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

const AIPlaceholder = () => (
  <div className="w-full flex flex-col items-center text-center text-gray-500 mt-24">
    <h3 className="text-2xl font-bold">AI 광고 제작 기능 준비 중</h3>
    <p className="mt-4 text-lg">팀원이 열심히 개발하고 있어요. 조금만 기다려주세요!</p>
  </div>
);

const CASH = ({ initialTab = "ad" }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingName, setLoadingName] = useState("");
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  const navigate = useNavigate();

  const resetForms = useCallback(() => {
    setIsFormDirty(false);
    setFormResetKey(prev => prev + 1);
  }, []);

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

  const handleFeeExecute = useCallback((formData) => {
    if (!formData.file) {
      alert("분석할 엑셀/CSV 파일을 업로드해주세요.");
      return;
    }

    setIsLoading(true);
    setLoadingName(formData.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet); 

        const rawData = jsonData.map(row => {
          let date = row.date;
          if (typeof date === 'number') { 
            const excelEpoch = new Date(1899, 11, 30);
            const excelDate = new Date(excelEpoch.getTime() + date * 86400000);
            date = excelDate.toISOString().split('T')[0];
          }
          return { ...row, date, platform: normalizePlatform(row.platform) };
        });

        const analysisResult = processAnalysisData(rawData);
        
        setTimeout(() => {
          setIsLoading(false);
          resetForms();
          navigate("/chart-result", { state: { analysisResult, name: formData.name } });
        }, 3000); 

      } catch (error) {
        setIsLoading(false);
        alert(`파일 처리 중 오류가 발생했습니다: ${error.message}`);
      }
    };
    
    reader.onerror = (error) => {
      setIsLoading(false);
      alert(`파일을 읽는 중 오류가 발생했습니다: ${error.message}`);
    };

    reader.readAsBinaryString(formData.file); 

  }, [navigate, resetForms]);

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

