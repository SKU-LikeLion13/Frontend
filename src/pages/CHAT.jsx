import React, { useState, useEffect, useRef } from "react";
import { api } from "../utils/apiClient.js";

// 스크롤바 스타일 정의
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #4a4a4a;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #6a6a6a;
  }
`;

// 로딩 인디케이터 컴포넌트
const ThinkingIndicator = () => (
  <div className="flex items-center gap-1">
    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></span>
  </div>
);

// AI 챗봇 페이지 컴포넌트
const CHAT = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollContainerRef = useRef(null);
  const [batchId, setBatchId] = useState(0);

  // 대화 기록 로드
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const { data } = await api.get('/api/chat/history');
        if (Array.isArray(data) && data.length > 0) {
          const historyMessages = data.map(msg => ({
            id: msg.id,
            text: msg.content,
            sender: msg.role === 'user' ? 'user' : 'assistant',
          }));
          setMessages(historyMessages);
          // 마지막 batchId 추출
          const lastMsg = data[data.length - 1];
          if (lastMsg?.batchId) {
            setBatchId(lastMsg.batchId);
          }
        } else {
          // 대화 기록이 없으면 초기 메시지 표시
          setMessages([
            { id: 1, text: "안녕하세요. 무엇이 궁금하신가요?", sender: "assistant" },
          ]);
        }
      } catch (error) {
        console.error('대화 기록 로드 실패:', error);
        // 에러 시에도 초기 메시지 표시
        setMessages([
          { id: 1, text: "안녕하세요. 무엇이 궁금하신가요?", sender: "assistant" },
        ]);
      }
    };
    loadChatHistory();
  }, []);

  // 메시지 목록이 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 추천 질문 데이터
  const suggestionButtons = [
    {
      text: "광고 제작",
      response:
        "Adwise 광고 제작은 업종과 타겟 정보를 입력하면, AI가 자동으로 문구와 이미지를 생성해 각 플랫폼에 맞게 최적화해드립니다. 완성된 광고는 미리보기 후 바로 집행 가능합니다.",
    },
    {
      text: "제작 기간",
      response: "광고 제작은 AI를 사용해 최대 10분 소요됩니다.",
    },
    { text: "수수료 문의", response: "수수료는 광고 예산의 10%입니다." },
    {
      text: "차트 오류",
      response:
        "차트 오류가 발생했다면, 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.",
    },
    {
      text: "기타 문의사항",
      response: "기타 문의는 support@adwise.com으로 연락주세요.",
    },
  ];

  // 추천 질문 클릭 처리 함수 (API 호출 없음)
  const handleSuggestionClick = (suggestion) => {
    if (isLoading) return;
    
    const userMessage = {
      id: Date.now(),
      text: suggestion.text,
      sender: "user",
    };
    
    setShowSuggestions(false);
    setIsLoading(true);

    // 사용자 질문을 먼저 보여줌
    setMessages((prev) => [...prev, userMessage]);

    // 약간의 지연 후 미리 준비된 답변을 보여줌
    setTimeout(() => {
      const assistantMessage = {
        id: Date.now() + 1,
        text: suggestion.response,
        sender: "assistant",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
      setShowSuggestions(true);
    }, 500);
  };

  // 메시지 전송 처리 함수 (API 호출)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (trimmedInput === "" || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: trimmedInput,
      sender: "user",
    };

    setShowSuggestions(false);
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: "thinking", sender: "assistant", thinking: true },
    ]);

    setInputValue("");
    setIsLoading(true);

    try {
      const { data } = await api.post('/api/chat/send', {
        message: trimmedInput,
        batchId: batchId
      });
      
      const assistantMessage = {
        id: Date.now(),
        text: data.response,
        sender: "assistant",
      };

      // batchId 업데이트
      if (data.batchId) {
        setBatchId(data.batchId);
      }

      setMessages((prev) => prev.filter(msg => msg.id !== 'thinking').concat(assistantMessage));

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage = {
        id: Date.now(),
        text: "죄송합니다, 답변을 생성하는 중 오류가 발생했습니다.",
        sender: "assistant",
      };
      setMessages((prev) => prev.filter(msg => msg.id !== 'thinking').concat(errorMessage));
    } finally {
      setIsLoading(false);
      setShowSuggestions(true);
    }
  };

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="flex items-center justify-center min-h-screen bg-[#1B1B1B] text-white font-sans">
        <div className="w-full max-w-5xl bg-[#1B1B1B] border border-orange-500 rounded-xl p-7 flex flex-col mx-4 mt-24 mb-48 h-[90vh] max-h-[800px]">
          <div className="flex items-center gap-4 flex-shrink-0 mb-16">
            <img src="/img/Message Bot.png" alt="Chatbot Icon" className="w-12 h-12" />
            <h2 className="text-3xl font-bold">AI 챗봇과 궁금증 해결하기</h2>
          </div>

          <div ref={scrollContainerRef} className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`py-3 px-5 rounded-2xl max-w-[80%] ${msg.sender === "user" ? "bg-zinc-600" : "bg-[#FF9550] text-zinc-800 font-bold"}`}>
                  {msg.thinking ? <ThinkingIndicator /> : <p className="whitespace-pre-wrap">{msg.text}</p>}
                </div>
              </div>
            ))}
          </div>

          {showSuggestions && !isLoading && (
            <div className="flex flex-wrap gap-3 flex-shrink-0 mt-6">
              {suggestionButtons.map((btn) => (
                <button
                  key={btn.text}
                  onClick={() => handleSuggestionClick(btn)}
                  className={`rounded-full py-2 px-5 text-sm cursor-pointer transition-colors border bg-zinc-700 text-white border-zinc-600 hover:bg-[#FF7D29] hover:border-transparent`}
                >
                  {btn.text}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center bg-zinc-700 rounded-full p-2 flex-shrink-0 mt-6">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isLoading ? "응답을 기다리는 중..." : "채팅을 입력하세요."}
              className="flex-grow bg-transparent border-none outline-none text-white placeholder:text-zinc-400 px-4"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="group bg-transparent border-none cursor-pointer p-2 rounded-full transition-colors hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors group-hover:stroke-orange-500" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors group-hover:stroke-orange-500" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CHAT;
