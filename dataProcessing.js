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
  
  const timeframes = {
    '1y': 12,
    '3y': 36,
    '5y': 60,
    '10y': 120,
    'all': Infinity
  };
  
  const months = timeframes[timeframe];
  if (months === Infinity) return data;
  
  const latestDate = d3.max(data, d => d.date);
  const cutoffDate = new Date(latestDate);
  cutoffDate.setMonth(cutoffDate.getMonth() - months);
  
  return data.filter(d => d.date >= cutoffDate);
};

/**
 * 处理Alberta总体失业率数据
 */
export const processAlbertaData = (data) => {
  if (!data || !Array.isArray(data)) return [];
  
  const filteredData = data.filter(item => 
    item.GeoName === "Alberta" && 
    (item.Characteristic === "Unemployment rate" || item.Characteristics === "Unemployment rate") &&
    item.Sex === "Both sexes" &&
    item.Age === "15 years and over"
  );
  
  return filteredData.map(item => ({
    date: new Date(item.Date),
    value: item.Value || 0,
    formattedDate: formatDate(new Date(item.Date))
  })).sort((a, b) => a.date - b.date);
};

/**
 * 处理省份数据
 */
export const processProvinceData = (data) => {
  if (!data || !Array.isArray(data)) return [];
  
  // 筛选失业率数据和15岁及以上人口
  const filteredData = data.filter(item => 
    (item.Characteristic === "Unemployment rate" || item.Characteristics === "Unemployment rate") &&
    item.Sex === "Both sexes" &&
    item.Age === "15 years and over"
  );
  
  // 按日期分组
  const groupedByDate = d3.group(filteredData, d => d.Date);
  
  // 转换为数组
  return Array.from(groupedByDate, ([dateStr, items]) => {
    const obj = { 
      date: new Date(dateStr), 
      formattedDate: formatDate(new Date(dateStr)) 
    };
    
    // 添加各省份的值
    items.forEach(item => {
      if (item.GeoName) {
        obj[item.GeoName] = item.Value || 0;
      }
    });
    
    return obj;
  }).sort((a, b) => a.date - b.date);
};

/**
 * 处理行业数据
 */
export const processIndustryData = (data) => {
  if (!data || !Array.isArray(data)) return [];
  
  // 筛选Alberta失业率数据和15岁及以上人口、两性数据
  const filteredData = data.filter(item => 
    item.GeoName === "Alberta" && 
    (item.Characteristic === "Unemployment rate" || item.Characteristics === "Unemployment rate") &&
    item.Sex === "Both sexes" &&
    item.Age === "15 years and over"
  );
  
  // 按日期分组
  const groupedByDate = d3.group(filteredData, d => d.Date);
  
  // 转换为数组
  return Array.from(groupedByDate, ([dateStr, items]) => {
    const obj = { 
      date: new Date(dateStr), 
      formattedDate: formatDate(new Date(dateStr)) 
    };
    
    // 添加各行业的值
    items.forEach(item => {
      if (item["NAICS Description"]) {
        obj[item["NAICS Description"]] = item.Value || 0;
      } else if (item.NAICS) {
        obj[item.NAICS] = item.Value || 0;
      }
    });
    
    return obj;
  }).sort((a, b) => a.date - b.date);
};

/**
 * 处理性别数据
 */
export const processSexData = (data) => {
  if (!data || !Array.isArray(data)) return [];
  
  // 筛选Alberta失业率数据和15岁及以上人口
  const filteredData = data.filter(item => 
    item.GeoName === "Alberta" && 
    (item.Characteristic === "Unemployment rate" || item.Characteristics === "Unemployment rate") &&
    item.Age === "15 years and over"
  );
  
  // 按日期分组
  const groupedByDate = d3.group(filteredData, d => d.Date);
  
  // 转换为数组
  return Array.from(groupedByDate, ([dateStr, items]) => {
    const obj = { 
      date: new Date(dateStr), 
      formattedDate: formatDate(new Date(dateStr)) 
    };
    
    // 添加各性别的值
    items.forEach(item => {
      if (item.Sex) {
        obj[item.Sex] = item.Value || 0;
      }
    });
    
    return obj;
  }).sort((a, b) => a.date - b.date);
};

/**
 * 处理年龄组数据
 */
export const processAgeData = (data) => {
  if (!data || !Array.isArray(data)) return [];
  
  // 筛选Alberta失业率数据和两性数据
  const filteredData = data.filter(item => 
    item.GeoName === "Alberta" && 
    (item.Characteristic === "Unemployment rate" || item.Characteristics === "Unemployment rate") &&
    item.Sex === "Both sexes"
  );
  
  // 按日期分组
  const groupedByDate = d3.group(filteredData, d => d.Date);
  
  // 转换为数组
  return Array.from(groupedByDate, ([dateStr, items]) => {
    const obj = { 
      date: new Date(dateStr), 
      formattedDate: formatDate(new Date(dateStr)) 
    };
    
    // 添加各年龄组的值
    items.forEach(item => {
      if (item.Age) {
        obj[item.Age] = item.Value || 0;
      }
    });
    
    return obj;
  }).sort((a, b) => a.date - b.date);
};

/**
 * 处理教育程度数据
 */
export const processEducationData = (data) => {
  if (!data || !Array.isArray(data)) return [];
  
  // 筛选Alberta失业率数据和15岁及以上人口、两性数据
  const filteredData = data.filter(item => 
    item.GeoName === "Alberta" && 
    (item.Characteristic === "Unemployment rate" || item.Characteristics === "Unemployment rate") &&
    item.Sex === "Both sexes" &&
    item.Age === "15 years and over"
  );
  
  // 按日期分组
  const groupedByDate = d3.group(filteredData, d => d.Date);
  
  // 转换为数组
  return Array.from(groupedByDate, ([dateStr, items]) => {
    const obj = { 
      date: new Date(dateStr), 
      formattedDate: formatDate(new Date(dateStr)) 
    };
    
    // 添加各教育程度的值
    items.forEach(item => {
      if (item.Education) {
        obj[item.Education] = item.Value || 0;
      }
    });
    
    return obj;
  }).sort((a, b) => a.date - b.date);
};

/**
 * 处理城市(CMA)数据
 */
export const processCMAData = (data) => {
  if (!data || !Array.isArray(data)) return [];
  
  // 筛选城市失业率数据
  const filteredData = data.filter(item => 
    item.Characteristics === "Unemployment rate" &&
    item.GeoName !== "Alberta" && // 排除Alberta整体数据
    ["Calgary", "Edmonton", "Lethbridge", "Red Deer"].includes(item.GeoName) // 只包含Alberta的城市
  );
  
  // 找到包含数据的最新日期
  const datesWithData = filteredData
    .filter(item => item.Value !== null)
    .map(item => new Date(item.Date));
  
  if (datesWithData.length === 0) return [];
  
  const latestDate = d3.max(datesWithData);
  
  if (!latestDate) return [];
  
  // 筛选最新数据
  const latestData = filteredData.filter(item => 
    new Date(item.Date).getTime() === latestDate.getTime() &&
    item.Value !== null
  );
  
  // 按失业率排序
  return latestData.sort((a, b) => (b.Value || 0) - (a.Value || 0));
};

/**
 * 处理经济区域数据
 */
export const processRegionData = (data) => {
  if (!data || !Array.isArray(data)) return [];
  
  // 筛选区域失业率数据 - 只包含Alberta的地区
  const albertaRegions = [
    "Wood Buffalo-Cold Lake",
    "Camrose-Drumheller",
    "Calgary",
    "Banff-Jasper-Rocky Mountain House and Athabasca-Grande Prairie-Peace River",
    "Edmonton",
    "Lethbridge-Medicine Hat",
    "Red Deer"
  ];
  
  const filteredData = data.filter(item => 
    item.Characteristics === "Unemployment rate" &&
    albertaRegions.includes(item.GeoName)
  );
  
  // 找到包含数据的最新日期
  const datesWithData = filteredData
    .filter(item => item.Value !== null)
    .map(item => new Date(item.Date));
  
  if (datesWithData.length === 0) return [];
  
  const latestDate = d3.max(datesWithData);
  
  if (!latestDate) return [];
  
  // 筛选最新数据
  const latestData = filteredData.filter(item => 
    new Date(item.Date).getTime() === latestDate.getTime() &&
    item.Value !== null
  );
  
  // 按失业率排序
  return latestData.sort((a, b) => (b.Value || 0) - (a.Value || 0));
};

/**
 * 处理职业数据
 */
export const processOccupationData = (data) => {
  if (!data || !Array.isArray(data)) return [];
  
  // 筛选Alberta失业率数据和两性数据
  const filteredData = data.filter(item => 
    item.GeoName === "Alberta" && 
    item.Characteristics === "Unemployment rate" &&
    item.Sex === "Both sexes"
  );
  
  // 按日期分组
  const groupedByDate = d3.group(filteredData, d => d.Date);
  
  // 转换为数组
  return Array.from(groupedByDate, ([dateStr, items]) => {
    const obj = { 
      date: new Date(dateStr), 
      formattedDate: formatDate(new Date(dateStr)) 
    };
    
    // 添加各职业的值
    items.forEach(item => {
      if (item["NOC Description"]) {
        obj[item["NOC Description"]] = item.Value || 0;
      } else if (item.NOC) {
        obj[item.NOC] = item.Value || 0;
      }
    });
    
    return obj;
  }).sort((a, b) => a.date - b.date);
};

/**
 * 获取可用的省份列表
 */
export const getAvailableProvinces = (data) => {
  if (!data || data.length === 0) return [];
  
  const provinces = new Set();
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'date' && key !== 'formattedDate') {
        provinces.add(key);
      }
    });
  });
  
  return Array.from(provinces)
    .filter(province => province !== 'undefined' && province !== 'null')
    .sort();
};

/**
 * 获取可用的行业列表
 */
export const getAvailableIndustries = (data) => {
  if (!data || data.length === 0) return [];
  
  const industries = new Set();
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'date' && key !== 'formattedDate') {
        industries.add(key);
      }
    });
  });
  
  return Array.from(industries)
    .filter(industry => industry !== 'undefined' && industry !== 'null')
    .sort();
};

/**
 * 获取可用年龄组列表
 */
export const getAvailableAgeGroups = (data) => {
  if (!data || data.length === 0) return [];
  
  const ageGroups = new Set();
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'date' && key !== 'formattedDate' && key.includes('years')) {
        ageGroups.add(key);
      }
    });
  });
  
  return Array.from(ageGroups).sort();
};

/**
 * 获取可用教育程度列表
 */
export const getAvailableEducationLevels = (data) => {
  if (!data || data.length === 0) return [];
  
  const educationLevels = new Set();
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'date' && key !== 'formattedDate') {
        educationLevels.add(key);
      }
    });
  });
  
  return Array.from(educationLevels).sort();
};

/**
 * 获取可用职业列表
 */
export const getAvailableOccupations = (data) => {
  if (!data || data.length === 0) return [];
  
  const occupations = new Set();
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'date' && key !== 'formattedDate') {
        occupations.add(key);
      }
    });
  });
  
  return Array.from(occupations).sort();
};
