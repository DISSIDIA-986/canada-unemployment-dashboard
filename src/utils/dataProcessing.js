import * as d3 from 'd3';

/**
 * 将日期格式化为 YYYY-MM
 */
export const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * 根据选择的时间范围筛选数据
 */
export const filterByTimeframe = (data, timeframe) => {
  if (!data || data.length === 0) return [];

  const now = new Date();
  let cutoffDate;

  switch (timeframe) {
    case '1y':
      cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    case '3y':
      cutoffDate = new Date(now.setFullYear(now.getFullYear() - 3));
      break;
    case '5y':
      cutoffDate = new Date(now.setFullYear(now.getFullYear() - 5));
      break;
    case '10y':
      cutoffDate = new Date(now.setFullYear(now.getFullYear() - 10));
      break;
    case 'all':
    default:
      return data;
  }

  return data.filter(item => item.date >= cutoffDate);
};

/**
 * 处理Alberta失业率数据
 * 
 * @param {Array} data - 原始Alberta失业率数据
 * @returns {Array} 处理后的Alberta失业率数据
 */
export const processAlbertaData = (data) => {
  if (!data || data.length === 0) return [];

  // 只保留Alberta的数据和失业率数据
  const albertaData = data.filter(item => 
    item.GeoName === 'Alberta' && 
    item.Characteristic === 'Unemployment rate'
  );

  // 按日期排序并格式化数据
  const processedData = albertaData.map(item => {
    const date = new Date(item.Date);
    return {
      date,
      formattedDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      value: item.Value
    };
  }).sort((a, b) => a.date - b.date);

  return processedData;
};

/**
 * 处理省份失业率数据
 * 
 * @param {Array} data - 原始省份失业率数据
 * @returns {Array} 处理后的省份失业率数据
 */
export const processProvinceData = (data) => {
  if (!data || data.length === 0) return [];

  // 只保留失业率数据
  const unemploymentRateData = data.filter(item => 
    item.Characteristic === 'Unemployment rate' && 
    item.Age === '15 years and over' &&
    item.Sex === 'Both sexes'
  );
  
  // 按日期分组
  const groupedByDate = {};
  
  unemploymentRateData.forEach(item => {
    const date = new Date(item.Date);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!groupedByDate[formattedDate]) {
      groupedByDate[formattedDate] = {
        date,
        formattedDate
      };
    }
    
    // 添加省份数据
    groupedByDate[formattedDate][item.GeoName] = item.Value;
  });
  
  // 转换为数组并按日期排序
  return Object.values(groupedByDate).sort((a, b) => a.date - b.date);
};

/**
 * 处理行业失业率数据
 * 
 * @param {Array} data - 原始行业失业率数据
 * @returns {Array} 处理后的行业失业率数据
 */
export const processIndustryData = (data) => {
  if (!data || data.length === 0) return [];

  // 添加调试日志
  console.log("Processing industry data, total records:", data.length);

  // 不再限制只有Alberta的数据
  // const albertaData = data.filter(item => item.GeoName === 'Alberta');
  // console.log("Alberta industry records:", albertaData.length);
  
  // 检查各种可能的特征名称
  const characteristics = new Set(data.map(item => item.Characteristics || item.Characteristic));
  console.log("Available characteristics:", Array.from(characteristics));
  
  // 检查是否有Unemployment rate特征
  const hasUnemploymentRate = data.some(item => 
    (item.Characteristics || item.Characteristic) === 'Unemployment rate'
  );
  console.log("Has Unemployment rate:", hasUnemploymentRate);

  // 优先使用Unemployment rate，如果不存在则尝试使用Unemployment
  const characteristicToUse = hasUnemploymentRate ? 'Unemployment rate' : 'Unemployment';
  console.log("Using characteristic:", characteristicToUse);
  
  // 只保留失业率数据，支持两种可能的字段名
  const unemploymentRateData = data.filter(item => {
    const charField = item.Characteristics || item.Characteristic;
    return charField === characteristicToUse;
  });
  
  console.log("Filtered unemployment rate records:", unemploymentRateData.length);
  if (unemploymentRateData.length > 0) {
    console.log("Sample industry record:", unemploymentRateData[0]);
  }
  
  // 按日期分组
  const groupedByDate = {};
  
  unemploymentRateData.forEach(item => {
    const date = new Date(item.Date);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!groupedByDate[formattedDate]) {
      groupedByDate[formattedDate] = {
        date,
        formattedDate
      };
    }
    
    // 找出行业描述字段
    const industryName = item['NAICS Description'] || item.Industry;
    if (industryName) {
      // 如果使用的是Unemployment而不是Unemployment rate，需要将值转换为百分比
      if (characteristicToUse === 'Unemployment') {
        // 这里需要根据实际数据特点进行调整
        groupedByDate[formattedDate][industryName] = parseFloat((item.Value / 1000).toFixed(1));
      } else {
        groupedByDate[formattedDate][industryName] = item.Value;
      }
    }
  });
  
  console.log("Grouped dates:", Object.keys(groupedByDate).length);
  
  // 转换为数组并按日期排序
  const result = Object.values(groupedByDate).sort((a, b) => a.date - b.date);
  console.log("Final processed industry data:", result.length);
  
  return result;
};

/**
 * 处理性别失业率数据
 * 
 * @param {Array} data - 原始性别失业率数据
 * @returns {Array} 处理后的性别失业率数据
 */
export const processSexData = (data) => {
  if (!data || data.length === 0) return [];

  // 按日期分组
  const groupedByDate = {};

  data.forEach(item => {
    const date = item.Date;
    const series = item.Series; // 使用Series字段代替原来的Sex字段
    const value = item.Value;

    if (!groupedByDate[date]) {
      groupedByDate[date] = {
        date: new Date(date),
        formattedDate: date.substring(0, 7), // 使用YYYY-MM格式
        Male: null,
        Female: null
      };
    }

    // 填充相应性别的数据
    if (series === 'Male' || series === 'Female') {
      groupedByDate[date][series] = value;
    }
  });

  // 将对象转换为数组并按日期排序
  return Object.values(groupedByDate).sort((a, b) => a.date - b.date);
};

/**
 * 处理年龄组失业率数据
 * 
 * @param {Array} data - 原始年龄组失业率数据
 * @returns {Array} 处理后的年龄组失业率数据
 */
export const processAgeData = (data) => {
  if (!data || data.length === 0) return [];

  console.log('原始年龄数据示例:', data[0]); // 添加调试日志
  
  const groupedByDate = {};
  
  data.forEach(item => {
    // 放宽GeoName的筛选条件，同时接受Alberta和Canada
    // 改为检测Characteristic包含Unemployment
    if (!item.Characteristic || !item.Characteristic.includes('Unemployment')) return;
    
    const date = new Date(item.Date);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const key = formattedDate;
    
    if (!groupedByDate[key]) {
      groupedByDate[key] = {
        date,
        formattedDate
      };
    }
    
    // 保存数据，不再严格检查年龄组名称
    if (item.Age) {
      groupedByDate[key][item.Age] = item.Value;
    }
  });
  
  console.log('处理后数据条数:', Object.keys(groupedByDate).length);
  
  // 转换为数组，并按日期排序
  return Object.values(groupedByDate).sort((a, b) => a.date - b.date);
};

/**
 * 处理教育程度失业率数据
 * 
 * @param {Array} data - 原始教育程度失业率数据
 * @returns {Array} 处理后的教育程度失业率数据
 */
export const processEducationData = (data) => {
  if (!data || data.length === 0) return [];

  console.log('原始教育数据示例:', data[0]); // 添加调试日志
  
  const groupedByDate = {};
  
  data.forEach(item => {
    // 检查字段大小写
    const characteristics = item.Characteristics || item.characteristics;
    const geoName = item.GeoName || item.geoname;
    const education = item.Education || item.education;
    
    // 放宽筛选条件
    if (characteristics !== 'Unemployment rate') return;
    
    const date = new Date(item.Date);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!groupedByDate[formattedDate]) {
      groupedByDate[formattedDate] = {
        date,
        formattedDate
      };
    }
    
    // 添加教育程度数据
    if (education) {
      groupedByDate[formattedDate][education] = item.Value;
    }
  });
  
  console.log('处理后数据条数:', Object.keys(groupedByDate).length);
  
  return Object.values(groupedByDate).sort((a, b) => a.date - b.date);
};

/**
 * 处理CMA城市失业率数据
 * 
 * @param {Array} data - 原始CMA城市失业率数据
 * @returns {Array} 处理后的CMA城市失业率数据
 */
/**
 * 处理CMA城市失业率数据 - 全加拿大版本
 * 
 * @param {Array} data - 原始CMA城市失业率数据
 * @returns {Array} 处理后的CMA城市失业率数据
 */
export const processCMAData = (data) => {
  if (!data || data.length === 0) return [];

  // 仅保留失业率数据
  const unemploymentRateData = data.filter(item => 
    item.Characteristics === 'Unemployment rate'
  );
  
  // 找到最新的日期
  const sortedData = [...unemploymentRateData].sort((a, b) => 
    new Date(b.Date) - new Date(a.Date)
  );
  
  // 获取最新日期的数据
  const latestDate = sortedData.length > 0 ? sortedData[0].Date : null;
  const latestData = sortedData.filter(item => item.Date === latestDate);
  
  // 返回所有CMA数据，不再限制只有Alberta的城市
  return latestData.sort((a, b) => (b.Value || 0) - (a.Value || 0));
};

/**
 * 处理区域失业率数据
 * 
 * @param {Array} data - 原始区域失业率数据
 * @returns {Array} 处理后的区域失业率数据
 */
export const processRegionData = (data) => {
  if (!data || data.length === 0) return [];

  // 仅保留失业率数据
  const unemploymentRateData = data.filter(item => 
    item.Characteristics === 'Unemployment rate'
  );
  
  // 找到最新的日期
  const sortedData = [...unemploymentRateData].sort((a, b) => 
    new Date(b.Date) - new Date(a.Date)
  );
  
  // 获取最新日期的数据
  const latestDate = sortedData.length > 0 ? sortedData[0].Date : null;
  const latestData = sortedData.filter(item => item.Date === latestDate);
  
  // 只返回Alberta内的区域，并按失业率排序
  return latestData
    .filter(item => 
      ['Banff-Jasper-Rocky Mountain House and Athabasca-Grande Prairie-Peace River', 
      'Camrose-Drumheller', 
      'Edmonton', 
      'Lethbridge-Medicine Hat', 
      'Red Deer', 
      'Wood Buffalo-Cold Lake'].includes(item.GeoName)
    )
    .sort((a, b) => (b.Value || 0) - (a.Value || 0));
};

/**
 * 处理职业失业率数据
 * 
 * @param {Array} data - 原始职业失业率数据
 * @returns {Array} 处理后的职业失业率数据
 */
export const processOccupationData = (data) => {
  if (!data || data.length === 0) return [];

  // 只保留Alberta的数据、失业率数据和全部性别
  const albertaData = data.filter(item => 
    item.GeoName === 'Alberta' && 
    item.Characteristics === 'Unemployment rate' &&
    item.Sex === 'Both sexes'
  );
  
  // 按日期分组
  const groupedByDate = {};
  
  albertaData.forEach(item => {
    const date = new Date(item.Date);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!groupedByDate[formattedDate]) {
      groupedByDate[formattedDate] = {
        date,
        formattedDate
      };
    }
    
    // 添加职业数据
    const occupationName = item['NOC Description'];
    if (occupationName) {
      groupedByDate[formattedDate][occupationName] = item.Value;
    }
  });
  
  // 转换为数组并按日期排序
  return Object.values(groupedByDate).sort((a, b) => a.date - b.date);
};

/**
 * 获取可用省份
 * 
 * @param {Array} data - 省份数据
 * @returns {Array} 可用省份列表
 */
export const getAvailableProvinces = (data) => {
  if (!data || data.length === 0) return [];
  
  const provinces = new Set();
  
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (!['date', 'formattedDate'].includes(key)) {
        provinces.add(key);
      }
    });
  });
  
  return Array.from(provinces).sort();
};

/**
 * 获取可用行业
 * 
 * @param {Array} data - 行业数据
 * @returns {Array} 可用行业列表
 */
export const getAvailableIndustries = (data) => {
  if (!data || data.length === 0) return [];
  
  const industries = new Set();
  
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (!['date', 'formattedDate'].includes(key)) {
        industries.add(key);
      }
    });
  });
  
  return Array.from(industries).sort();
};

/**
 * 获取可用教育程度列表
 * 
 * @param {Array} data - 教育程度数据
 * @returns {Array} 可用教育程度列表
 */
export const getAvailableEducationLevels = (data) => {
  if (!data || data.length === 0) return [];
  
  const educationLevels = new Set();
  
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (!['date', 'formattedDate'].includes(key)) {
        educationLevels.add(key);
      }
    });
  });
  
  return Array.from(educationLevels).sort();
};

/**
 * 获取可用年龄组
 * 
 * @param {Array} data - 年龄组数据
 * @returns {Array} 可用年龄组列表
 */
export const getAvailableAgeGroups = (data) => {
  if (!data || data.length === 0) return [];
  
  const ageGroups = new Set();
  
  // 检查数据的第一个对象以确定可用的年龄组
  const firstEntry = data[0];
  if (firstEntry) {
    Object.keys(firstEntry).forEach(key => {
      if (['date', 'formattedDate'].includes(key)) return;
      if (firstEntry[key] !== null && firstEntry[key] !== undefined) {
        ageGroups.add(key);
      }
    });
  }
  
  return Array.from(ageGroups);
};

/**
 * 获取可用职业列表
 * 
 * @param {Array} data - 职业数据
 * @returns {Array} 可用职业列表
 */
export const getAvailableOccupations = (data) => {
  if (!data || data.length === 0) return [];
  
  const occupations = new Set();
  
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (!['date', 'formattedDate'].includes(key)) {
        occupations.add(key);
      }
    });
  });
  
  return Array.from(occupations).sort();
};
