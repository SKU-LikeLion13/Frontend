import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FiBarChart2,
  FiCalendar,
  FiHelpCircle,
  FiArrowLeft,
  FiArrowDown,
  FiArrowUp,
} from "react-icons/fi";
import { METRIC_CONFIG, formatMetric } from "../utils/metrics"; // 지표 관련 유틸 함수
import { FaMousePointer } from "react-icons/fa"; // metrics.js에서 사용됨

// --- 상수 & 보조 함수 ---

const POINT_COLOR = "#FF7D29";

// 지표 설명 카드
const MetricDefinitionCard = ({ metricKey }) => {
  const { name, fullName, Icon, goal, goalDirection, summary } =
    METRIC_CONFIG[metricKey];
  return (
    <div className="bg-[#2D2D2D] p-4 rounded-lg border border-gray-700">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 border border-gray-600">
          <Icon className="text-xl text-[#FF7D29]" />
        </div>
        <div>
          <p className="text-lg font-bold text-white">
            {name}{" "}
            <span className="text-sm font-normal text-gray-400">
              ({fullName})
            </span>
          </p>
          <div
            className={`flex items-center gap-1 text-xs font-semibold mt-1 ${
              goalDirection === "down" ? "text-blue-400" : "text-red-400"
            }`}
          >
            {goalDirection === "down" ? <FiArrowDown /> : <FiArrowUp />}
            <span>{goal}</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-300 mt-3">{summary}</p>
    </div>
  );
};

// AI 분석 요약 영역
const AiAnalysisSummary = ({ platformData }) => {
  const [aiSummary, setAiSummary] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    if (!platformData || platformData.length === 0) {
      setAiSummary(null);
      return;
    }

    const fetchAiSummary = async () => {
      setIsAiLoading(true);
      setAiError(null);
      try {
        // AI에 보낼 데이터 정리
        const simplifiedData = platformData.map((p) => ({
          platform: p.platform,
          cpc: Math.round(p.cpc),
          cvr: (p.cvr).toFixed(1),
          roas: (p.roas).toFixed(1),
          roi: (p.roi).toFixed(1),
        }));

        const response = await fetch("/api/analyze-metrics", {
          // AI 분석 API 호출
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: simplifiedData }),
        });

        if (!response.ok) {
          throw new Error("AI 분석 서버에서 오류가 발생했습니다.");
        }

        const result = await response.json();
        setAiSummary(result.summary); // 결과 요약 저장
      } catch (error) {
        console.error("AI 분석 요청 오류:", error);
        setAiError("AI 분석 결과를 가져오는 데 실패했습니다.");
      } finally {
        setIsAiLoading(false);
      }
    };

    fetchAiSummary();
  }, [platformData]);

  return (
    <div className="bg-[#2D2D2D] p-6 rounded-xl border border-gray-700 mt-8">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <FiHelpCircle className="mr-2 text-[#FF7D29]" />
        AI 분석 최종 설명
      </h3>
      {isAiLoading && (
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7D29] mx-auto mb-2"></div>
          <p>AI가 데이터를 분석 중입니다...</p>
        </div>
      )}
      {aiError && <p className="text-red-400 text-center">{aiError}</p>}
      {aiSummary && !isAiLoading && !aiError && (
        <p className="text-gray-300 whitespace-pre-wrap">{aiSummary}</p>
      )}
      {!aiSummary && !isAiLoading && !aiError && (
        <p className="text-gray-500 text-center">
          AI 분석 결과를 기다리는 중입니다.
        </p>
      )}
    </div>
  );
};

// 데이터 없을 때 보여주는 컴포넌트
const NoData = ({ navigate }) => (
  <div
    className={`min-h-screen bg-[#1B1B1B] text-white font-sans p-8 flex flex-col items-center justify-center`}
  >
    <h2 className="text-3xl font-bold mb-4">분석할 데이터가 없습니다.</h2>
    <p className="text-xl text-gray-400 mb-8">
      이전 페이지로 돌아가 분석할 파일을 업로드해주세요.
    </p>
    <button
      onClick={() => navigate(-1)}
      className={`bg-[#FF7D29] text-black font-bold py-3 px-10 rounded-full text-lg transition-transform hover:scale-105 flex items-center gap-2`}
    >
      <FiArrowLeft /> 돌아가기
    </button>
  </div>
);

// 차트 카드 (지표별 차트)
const ChartCard = ({ metricKey, data, view, selectedPlatform }) => {
  const { name } = METRIC_CONFIG[metricKey];
  const chartData =
    view === "platform_summary"
      ? data.platformChartData
      : data.monthlyChartData[selectedPlatform] || [];
  const xAxisKey = view === "platform_summary" ? "platform" : "month";

  return (
    <div className="bg-[#2D2D2D] p-6 rounded-xl border border-gray-700">
      <h4 className="text-2xl font-bold text-white mb-4">{name}</h4>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4A4A4A" />
            <XAxis dataKey={xAxisKey} stroke="#9CA3AF" />
            <YAxis
              stroke="#9CA3AF"
              tickFormatter={(value) => formatMetric(value, metricKey)}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1B1B1B",
                border: "1px solid #4A4A4A",
              }}
              labelStyle={{ color: "#FFFFFF", fontWeight: "bold" }}
              formatter={(value) => [formatMetric(value, metricKey), name]}
            />
            <Line
              type="monotone"
              dataKey={metricKey}
              name={name}
              stroke={POINT_COLOR}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- 메인 ChartResult 컴포넌트 ---
const ChartResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { analysisResult, name } = location.state || {};
  const { platformChartData, monthlyChartData } = analysisResult || {};

  const [view, setView] = useState("platform_summary");
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  useEffect(() => {
    if (
      !selectedPlatform &&
      monthlyChartData &&
      Object.keys(monthlyChartData).length > 0
    ) {
      setSelectedPlatform(Object.keys(monthlyChartData)[0]);
    }
  }, [monthlyChartData, selectedPlatform]);

  if (!platformChartData || !monthlyChartData) {
    return <NoData navigate={navigate} />;
  }

  return (
    <div
      className={`min-h-screen bg-[#1B1B1B] text-white font-sans p-4 sm:p-8`}
    >
      <header className="w-full max-w-screen-xl mx-auto text-left mb-8">
        <h1 className="text-4xl md:text-5xl font-bold">
          {name}님의 광고 성과 대시보드
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          플랫폼별, 월별 광고 성과를 비교 분석한 결과입니다.
        </p>
      </header>

      <div className="w-full max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* 메인 콘텐츠 */}
        <main className="lg:col-span-2 w-full">
          {/* 보기 전환 버튼 & 플랫폼 선택 */}
          <div className="bg-[#2D2D2D] p-4 rounded-xl border border-gray-700 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("platform_summary")}
                className={`flex items-center gap-2 py-2 px-4 rounded-md font-semibold transition-colors ${
                  view === "platform_summary"
                    ? `bg-[#FF7D29] text-black`
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <FiBarChart2 /> 플랫폼별 요약
              </button>
              <button
                onClick={() => setView("monthly_detail")}
                className={`flex items-center gap-2 py-2 px-4 rounded-md font-semibold transition-colors ${
                  view === "monthly_detail"
                    ? `bg-[#FF7D29] text-black`
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <FiCalendar /> 월별 상세
              </button>
            </div>

            {view === "monthly_detail" && (
              <div className="flex items-center gap-2 p-1 bg-gray-800 rounded-md">
                {Object.keys(monthlyChartData).map((platform) => (
                  <button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    className={`py-1 px-3 rounded font-semibold text-sm transition-colors ${
                      selectedPlatform === platform
                        ? `bg-[#FF7D29] text-black`
                        : "bg-transparent hover:bg-gray-600"
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 지표별 차트 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {Object.keys(METRIC_CONFIG).map((metricKey) => (
              <ChartCard
                key={metricKey}
                metricKey={metricKey}
                data={{ platformChartData, monthlyChartData }}
                view={view}
                selectedPlatform={selectedPlatform}
              />
            ))}
          </div>
          <AiAnalysisSummary platformData={platformChartData} />
        </main>

        {/* 사이드바 (지표 해설) */}
        <aside className="w-full lg:sticky lg:top-8">
          <div className="bg-[#2D2D2D] p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <FiHelpCircle className="mr-2 text-[#FF7D29]" />
              지표 해설
            </h3>
            <div className="space-y-4">
              {Object.keys(METRIC_CONFIG).map((key) => (
                <MetricDefinitionCard key={key} metricKey={key} />
              ))}
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate(-1)}
              className={`bg-transparent border-2 border-[#FF7D29] text-[#FF7D29] font-bold py-2 px-8 rounded-full text-md transition-all hover:bg-[#FF7D29] hover:text-black flex items-center gap-2`}
            >
              <FiArrowLeft /> 돌아가기
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ChartResult;
