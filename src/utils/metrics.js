/**
 * 플랫폼명을 표준화하는 함수
 * @param {string} platform - 원본 플랫폼명
 * @returns {string} 표준화된 플랫폼명
 */
export const normalizePlatform = (platform) => {
  if (!platform) return 'Unknown';
  
  const lowerPlatform = platform.toLowerCase();
  
  // Meta 계열 (Facebook, Instagram 포함)
  if (lowerPlatform.includes('meta') || 
      lowerPlatform.includes('facebook') || 
      lowerPlatform.includes('instagram') ||
      lowerPlatform.includes('fb') ||
      lowerPlatform.includes('ig')) {
    return 'Meta';
  }
  
  // Naver 계열
  if (lowerPlatform.includes('naver') || 
      lowerPlatform.includes('네이버') ||
      lowerPlatform.includes('nvr')) {
    return 'Naver';
  }
  
  // Google 계열
  if (lowerPlatform.includes('google') || 
      lowerPlatform.includes('구글') ||
      lowerPlatform.includes('gdn') ||
      lowerPlatform.includes('ads')) {
    return 'Google';
  }
  
  // Kakao 계열
  if (lowerPlatform.includes('kakao') || 
      lowerPlatform.includes('카카오') ||
      lowerPlatform.includes('kak')) {
    return 'Kakao';
  }
  
  // TikTok
  if (lowerPlatform.includes('tiktok') || 
      lowerPlatform.includes('틱톡') ||
      lowerPlatform.includes('tt')) {
    return 'TikTok';
  }
  
  return platform;
};

/**
 * 분석 데이터를 처리하는 함수
 * @param {Array} rawData - 원본 데이터 배열
 * @returns {Object} 처리된 분석 결과
 */
export const processAnalysisData = (rawData) => {
  if (!rawData || !Array.isArray(rawData)) {
    return {
      data: [],
      summary: {
        totalRecords: 0,
        platforms: [],
        totalSpend: 0,
        averageSpend: 0
      }
    };
  }

  // 플랫폼별 데이터 그룹화
  const platformGroups = rawData.reduce((acc, item) => {
    const platform = normalizePlatform(item.platform);
    if (!acc[platform]) {
      acc[platform] = [];
    }
    acc[platform].push(item);
    return acc;
  }, {});

  // 플랫폼별 통계 계산
  const platformStats = Object.keys(platformGroups).map(platform => {
    const data = platformGroups[platform];
    const totalSpend = data.reduce((sum, item) => sum + (parseFloat(item.spend) || 0), 0);
    const totalClicks = data.reduce((sum, item) => sum + (parseInt(item.clicks) || 0), 0);
    const totalImpressions = data.reduce((sum, item) => sum + (parseInt(item.impressions) || 0), 0);
    
    return {
      platform,
      recordCount: data.length,
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalClicks,
      totalImpressions,
      averageSpend: data.length > 0 ? Math.round((totalSpend / data.length) * 100) / 100 : 0,
      ctr: totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0, // CTR in %
      cpc: totalClicks > 0 ? Math.round((totalSpend / totalClicks) * 100) / 100 : 0
    };
  });

  // 전체 통계 계산
  const totalRecords = rawData.length;
  const totalSpend = platformStats.reduce((sum, stat) => sum + stat.totalSpend, 0);
  const averageSpend = totalRecords > 0 ? Math.round((totalSpend / totalRecords) * 100) / 100 : 0;

  return {
    data: rawData,
    platformStats,
    summary: {
      totalRecords,
      platforms: Object.keys(platformGroups),
      totalSpend: Math.round(totalSpend * 100) / 100,
      averageSpend,
      platformCount: platformStats.length
    }
  };
};

/**
 * 데이터 유효성 검사 함수
 * @param {Array} data - 검사할 데이터
 * @returns {Object} 검사 결과
 */
export const validateData = (data) => {
  if (!data || !Array.isArray(data)) {
    return { isValid: false, errors: ['데이터가 배열이 아닙니다.'] };
  }

  const errors = [];
  const requiredFields = ['platform', 'date'];
  
  data.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (!row[field]) {
        errors.push(`행 ${index + 1}: ${field} 필드가 누락되었습니다.`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};
