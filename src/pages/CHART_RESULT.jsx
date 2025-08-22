import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from '../utils/apiClient.js'
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
import { METRIC_CONFIG, formatMetric } from "../utils/metrics";

// --- 상수 & 보조 함수 ---

const POINT_COLOR = "#FF7D29";

// 세션 헤더는 공용 클라이언트 인터셉터에서 자동 첨부됩니다.

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

// AI KPI 설명 컴포넌트
const KpiExplanation = ({ explanation, isLoading, error, title }) => {
  return (
    <div className="bg-[#2D2D2D] p-6 rounded-xl border border-gray-700 mt-8">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <FiHelpCircle className="mr-2 text-[#FF7D29]" />
        {title}
      </h3>
      {isLoading && (
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7D29] mx-auto mb-2"></div>
          <p>AI가 KPI 설명을 생성 중입니다...</p>
        </div>
      )}
      {error && <p className="text-red-400 text-center">{error}</p>}
      {explanation && !isLoading && !error && (
        <div className="space-y-4">
          {explanation.headline && (
            <div className="bg-[#1B1B1B] p-4 rounded-lg border border-gray-600">
              <h4 className="text-lg font-bold text-[#FF7D29] mb-2">핵심 요약</h4>
              <p className="text-gray-300">{explanation.headline}</p>
            </div>
          )}
          {explanation.bullets && explanation.bullets.length > 0 && (
            <div className="bg-[#1B1B1B] p-4 rounded-lg border border-gray-600">
              <h4 className="text-lg font-bold text-[#FF7D29] mb-2">주요 포인트</h4>
              <ul className="space-y-2">
                {explanation.bullets.map((bullet, index) => (
                  <li key={index} className="text-gray-300 flex items-start">
                    <span className="text-[#FF7D29] mr-2">•</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {explanation.risks && explanation.risks.length > 0 && (
            <div className="bg-[#1B1B1B] p-4 rounded-lg border border-red-500/30">
              <h4 className="text-lg font-bold text-red-400 mb-2">주의사항</h4>
              <ul className="space-y-2">
                {explanation.risks.map((risk, index) => (
                  <li key={index} className="text-gray-300 flex items-start">
                    <span className="text-red-400 mr-2">⚠</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {explanation.nextActions && explanation.nextActions.length > 0 && (
            <div className="bg-[#1B1B1B] p-4 rounded-lg border border-green-500/30">
              <h4 className="text-lg font-bold text-green-400 mb-2">다음 단계</h4>
              <ul className="space-y-2">
                {explanation.nextActions.map((action, index) => (
                  <li key={index} className="text-gray-300 flex items-start">
                    <span className="text-green-400 mr-2">→</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {!explanation && !isLoading && !error && (
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

  const [analysisResult, setAnalysisResult] = useState(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 서버에서 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. 플랫폼 목록 조회
        const { data: platforms } = await api.get('/api/ad-data/platforms');
        
        // 2. 플랫폼별 합계 데이터 조회
        const { data: platformReports } = await api.get('/api/ad-data/reports/platforms');
        
        // 3. 각 플랫폼의 월별 데이터 조회
        const monthlyData = {};
        for (const platform of platforms) {
          try {
            const { data: monthlyReports } = await api.get(`/api/ad-data/reports/${platform.code}/monthly`);
            monthlyData[platform.name] = monthlyReports.map(report => ({
              month: report.month || report.date,
              cpc: report.cpc,
              cvr: report.cvr,
              roas: report.roas,
              roi: report.roi,
            }));
          } catch (e) {
            console.warn(`Failed to load monthly data for ${platform.name}:`, e);
            monthlyData[platform.name] = [];
          }
        }

        // 4. 데이터 구조 변환
        const platformChartData = platformReports.map(report => ({
          platform: report.platformCode,
          cpc: report.cpc,
          cvr: report.cvr,
          roas: report.roas,
          roi: report.roi,
        }));

        const result = {
          platformChartData,
          monthlyChartData: monthlyData
        };

        setAnalysisResult(result);
        setName(localStorage.getItem("userName") || "사용자");
        
      } catch (error) {
        console.error("Failed to load data:", error);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const [view, setView] = useState("platform_summary");
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  // AI 설명 State
  const [aggregateExplanation, setAggregateExplanation] = useState(null);
  const [isAggregateLoading, setIsAggregateLoading] = useState(false);
  const [aggregateError, setAggregateError] = useState(null);

  const [monthlyExplanation, setMonthlyExplanation] = useState(null);
  const [isMonthlyLoading, setIsMonthlyLoading] = useState(false);
  const [monthlyError, setMonthlyError] = useState(null);

  // 전체 플랫폼 요약 설명 API 호출
  useEffect(() => {
    if (analysisResult?.platformChartData) {
      const getExplanation = async () => {
        setIsAggregateLoading(true);
        setAggregateError(null);
        try {
          const response = await api.post('/api/explain/platforms', {})
          setAggregateExplanation(response.data);
        } catch (error) {
          setAggregateError("전체 KPI 요약 정보를 가져오는 데 실패했습니다.");
          console.error(error);
        } finally {
          setIsAggregateLoading(false);
        }
      };
      getExplanation();
    }
  }, [analysisResult?.platformChartData]);

  // 특정 플랫폼 월별 설명 API 호출
  useEffect(() => {
    if (view === "monthly_detail" && selectedPlatform && analysisResult?.monthlyChartData) {
      const getExplanation = async () => {
        setIsMonthlyLoading(true);
        setMonthlyError(null);
        setMonthlyExplanation(null); // 플랫폼 변경 시 이전 데이터 초기화
        try {
          const response = await api.post(`/api/explain/platforms/${selectedPlatform}/monthly`, {})
          setMonthlyExplanation(response.data);
        } catch (error) {
          setMonthlyError(
            `${selectedPlatform}의 월별 KPI 정보를 가져오는 데 실패했습니다.`
          );
          console.error(error);
        } finally {
          setIsMonthlyLoading(false);
        }
      };
      getExplanation();
    }
  }, [view, selectedPlatform, analysisResult?.monthlyChartData]);

  // 초기 플랫폼 선택
  useEffect(() => {
    if (
      !selectedPlatform &&
      analysisResult?.monthlyChartData &&
      Object.keys(analysisResult.monthlyChartData).length > 0
    ) {
      setSelectedPlatform(Object.keys(analysisResult.monthlyChartData)[0]);
    }
  }, [analysisResult?.monthlyChartData, selectedPlatform]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1B1B1B] text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF7D29] mx-auto mb-4"></div>
          <p className="text-xl">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1B1B1B] text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#FF7D29] text-black font-bold py-2 px-6 rounded-full"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!analysisResult?.platformChartData || !analysisResult?.monthlyChartData) {
    return <NoData navigate={navigate} />;
  }

  const { platformChartData, monthlyChartData } = analysisResult;

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
                {Object.keys(analysisResult.monthlyChartData).map((platform) => (
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
                data={{ platformChartData: analysisResult.platformChartData, monthlyChartData: analysisResult.monthlyChartData }}
                view={view}
                selectedPlatform={selectedPlatform}
              />
            ))}
          </div>
          
          {/* AI KPI 설명 */}
          {view === 'platform_summary' && (
            <KpiExplanation
              title="AI 분석 최종 설명"
              explanation={aggregateExplanation}
              isLoading={isAggregateLoading}
              error={aggregateError}
            />
          )}
          {view === 'monthly_detail' && (
             <KpiExplanation
              title={`AI 분석 월별 설명 (${selectedPlatform})`}
              explanation={monthlyExplanation}
              isLoading={isMonthlyLoading}
              error={monthlyError}
            />
          )}
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
