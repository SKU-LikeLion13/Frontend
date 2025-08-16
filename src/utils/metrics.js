// 이 파일은 광고 성과 지표와 관련된 상수, 포맷팅 함수, 데이터 처리 로직을 포함합니다.
// 여러 컴포넌트에서 공통으로 사용되는 유틸리티 함수들을 중앙 집중화하여 관리합니다.

import { FaMousePointer } from 'react-icons/fa';
import { FiTarget, FiTrendingUp, FiDollarSign } from 'react-icons/fi';

// --- Constants ---

// 각 광고 지표에 대한 설정 (이름, 아이콘, 목표 방향, 요약 설명 등)
export const METRIC_CONFIG = {
  cpc: {
    name: 'CPC',
    fullName: '클릭당 비용',
    Icon: FaMousePointer,
    goal: '낮을수록 좋음',
    goalDirection: 'down',
    summary: '한 번의 클릭에 지출되는 평균 광고 비용으로, 광고비 효율성을 측정하는 기본 지표입니다.',
  },
  cvr: {
    name: 'CVR',
    fullName: '전환율',
    Icon: FiTarget,
    goal: '높을수록 좋음',
    goalDirection: 'up',
    summary: '광고를 클릭한 사용자 중 회원가입, 구매 등 목표 행동을 완료한 사용자의 비율로, 광고의 실질적인 효과를 나타냅니다.',
  },
  roas: {
    name: 'ROAS',
    fullName: '광고 수익률',
    Icon: FiTrendingUp,
    goal: '높을수록 좋음',
    goalDirection: 'up',
    summary: '광고비 1원 당 벌어들인 매출액으로, 광고 캠페인의 수익 창출 능력을 직접적으로 보여줍니다.',
  },
  roi: {
    name: 'ROI',
    fullName: '투자 대비 수익',
    Icon: FiDollarSign,
    goal: '높을수록 좋음',
    goalDirection: 'up',
    summary: '광고비를 포함한 모든 투자 비용을 제외한 순수익률로, 캠페인의 최종적인 성공 여부를 판단합니다.',
  },
};

// --- Helper Functions ---

// 지표 값을 읽기 쉬운 형식으로 포맷팅하는 함수
export const formatMetric = (value, metric) => {
  if (metric === 'cpc') return `${Math.round(value).toLocaleString()}원`;
  if (['cvr', 'roas', 'roi'].includes(metric)) return `${(value * 100).toFixed(1)}%`;
  return value.toLocaleString();
};

// 다양한 형식의 플랫폼 이름을 표준화하는 함수
export const normalizePlatform = (name) => {
  if (!name) return 'Unknown';
  const lowerCaseName = String(name).toLowerCase();
  if (lowerCaseName.includes('google')) return 'Google';
  if (lowerCaseName.includes('naver') || lowerCaseName.includes('네이버')) return 'Naver';
  if (lowerCaseName.includes('meta')) return 'Meta';
  if (lowerCaseName.includes('kakao')) return 'Kakao';
  return name;
};

/**
 * 업로드된 파일의 원시 데이터를 분석하여 차트에 필요한 두 가지 형태의 데이터로 가공합니다.
 * 각 행에 대해 CPC, CVR, ROAS, ROI 지표를 계산하고,
 * 플랫폼별 요약 데이터와 월별 상세 데이터를 생성합니다.
 * @param {Array<Object>} rawData - 파일에서 추출된 원시 데이터 배열 (platform, date, cost, clicks, conversions, revenue 포함)
 * @returns {{platformChartData: Array, monthlyChartData: Object}} - 플랫폼별 및 월별 차트 데이터
 */
export const processAnalysisData = (rawData) => {
  // 1. 원시 데이터 필터링 및 지표 계산
  const calculatedData = rawData
    .filter(row => row.platform && row.date && !isNaN(parseFloat(row.cost)) && !isNaN(parseInt(row.clicks, 10)) && !isNaN(parseInt(row.conversions, 10)) && !isNaN(parseFloat(row.revenue)))
    .map(row => {
      const cost = parseFloat(row.cost) || 0;
      const clicks = parseInt(row.clicks, 10) || 0;
      const conversions = parseInt(row.conversions, 10) || 0;
      const revenue = parseFloat(row.revenue) || 0;
      return {
        ...row,
        cost, clicks, conversions, revenue,
        cpc: clicks > 0 ? cost / clicks : 0,
        cvr: clicks > 0 ? conversions / clicks : 0,
        roas: cost > 0 ? revenue / cost : 0,
        roi: cost > 0 ? (revenue - cost) / cost : 0,
      };
    });

  // 2. 플랫폼별 요약 데이터 생성
  const platformSummary = {};
  calculatedData.forEach(row => {
    const platformName = row.platform;
    if (!platformSummary[platformName]) {
      platformSummary[platformName] = { cost: 0, clicks: 0, conversions: 0, revenue: 0 };
    }
    platformSummary[platformName].cost += row.cost;
    platformSummary[platformName].clicks += row.clicks;
    platformSummary[platformName].conversions += row.conversions;
    platformSummary[platformName].revenue += row.revenue;
  });

  const platformChartData = Object.entries(platformSummary).map(([platform, data]) => ({
    platform,
    cpc: data.clicks > 0 ? data.cost / data.clicks : 0,
    cvr: data.clicks > 0 ? data.conversions / data.clicks : 0,
    roas: data.cost > 0 ? data.revenue / data.cost : 0,
    roi: data.cost > 0 ? (data.revenue - data.cost) / data.cost : 0,
  }));

  // 3. 월별 상세 데이터 생성
  const monthlyDetail = {};
  calculatedData.forEach(row => {
    const platform = row.platform;
    const month = new Date(row.date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit' }).replace('. ', '-').replace('.', '');
    if (!monthlyDetail[platform]) monthlyDetail[platform] = {};
    if (!monthlyDetail[platform][month]) {
      monthlyDetail[platform][month] = { cost: 0, clicks: 0, conversions: 0, revenue: 0 };
    }
    const target = monthlyDetail[platform][month];
    target.cost += row.cost;
    target.clicks += row.clicks;
    target.conversions += row.conversions;
    target.revenue += row.revenue;
  });

  const monthlyChartData = {};
  Object.entries(monthlyDetail).forEach(([platform, months]) => {
    monthlyChartData[platform] = Object.entries(months).map(([month, data]) => ({
      month,
      cpc: data.clicks > 0 ? data.cost / data.clicks : 0,
      cvr: data.clicks > 0 ? data.conversions / data.clicks : 0,
      roas: data.cost > 0 ? data.revenue / data.cost : 0,
      roi: data.cost > 0 ? (data.revenue - data.cost) / data.cost : 0,
    })).sort((a, b) => a.month.localeCompare(b.month));
  });

  return { platformChartData, monthlyChartData };
};