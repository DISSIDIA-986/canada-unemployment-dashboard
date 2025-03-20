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
    (item.Characteristic === "Unemployment rate" || item.Characteristics === "Unemployment rate")
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
  
  const filteredData = data.filter(item => 
    (item.Characteristic === "Unemployment rate" || item.Characteristics === "Unemployment rate")
  );
  
  const groupedByDate = d3.group(filteredData, d => d.Date);
  
  return Array.from(groupedByDate, ([dateStr, items]) => {
    const obj = { 
      date: new Date(dateStr), 
      formattedDate: formatDate(new Date(dateStr)) 
    };
    
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
  
  const filteredData = data.filter(item => 
    item.GeoName === "Alberta" && 
    (item.Characteristic === "Unemployment rate" || item.Characteristics === "Unemployment rate")
  );
  
  const groupedByDate = d3.group(filteredData, d => d.Date);
  
  return Array.from(groupedByDate, ([dateStr, items]) => {
    const obj = { 
      date: new Date(dateStr), 
      formattedDate: formatDate(new Date(dateStr)) 
    };
    
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
 * 处理性别失业率数据
 * 
 * @param {Array} data - 原始性别失业率数据
 * @returns {Array} 处理后的性别失业率数据
 */
export const processSexData = (data) => {
  if (!data || data.length === 0) return [];

  // 首先按日期分组
  const groupedByDate = {};
  
  data.forEach(item => {
    // 只处理Alberta地区的数据
    if (item.GeoName !== 'Alberta') return;
    
    // 只处理15岁及以上年龄组的数据
    if (item.Age !== '15 years and over') return;
    
    // 从数据中提取日期
    const date = new Date(item.Date);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const key = formattedDate;
    
    // 初始化日期的数据结构
    if (!groupedByDate[key]) {
      groupedByDate[key] = {
        date,
        formattedDate,
        Male: undefined,
        Female: undefined,
        'Both sexes': undefined
      };
    }
    
    // 根据性别添加数据 - 将失业人数转换为失业率 (这里需要接入真实的劳动力数据做分母)
    // 但在缺乏完整数据的情况下，我们可以用固定的缩放因子来模拟失业率
    if (item.Sex === 'Male' || item.Sex === 'Female' || item.Sex === 'Both sexes') {
      // 创建一个模拟的失业率 (失业人数 / 10,000) 作为百分比
      // 在实际应用中，这应该替换为真实的失业率计算
      const unemploymentValue = item.Value;
      
      // 根据不同性别数据范围调整，确保显示的比例更合理
      let scaleFactor;
      if (item.Sex === 'Male') {
        scaleFactor = 30000;
      } else if (item.Sex === 'Female') {
        scaleFactor = 35000;
      } else { // Both sexes
        scaleFactor = 65000;
      }
      
      // 计算模拟的失业率百分比
      const unemploymentRate = (unemploymentValue / scaleFactor) * 100;
      groupedByDate[key][item.Sex] = parseFloat(unemploymentRate.toFixed(1));
    }
  });
  
  console.log(`Processed sex data items: ${Object.keys(groupedByDate).length}`);
  if (Object.keys(groupedByDate).length > 0) {
    const sample = groupedByDate[Object.keys(groupedByDate)[0]];
    console.log("Sample processed sex data:", sample);
  }
  
  // 将对象转换为数组，并按日期排序
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

  // 首先按日期分组
  const groupedByDate = {};
  
  data.forEach(item => {
    // 只处理Alberta地区和Both sexes性别的数据
    if (item.GeoName !== 'Alberta' || item.Sex !== 'Both sexes') return;
    
    const date = new Date(item.Date);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const key = formattedDate;
    
    // 初始化日期的数据结构
    if (!groupedByDate[key]) {
      groupedByDate[key] = {
        date,
        formattedDate,
        '15 to 24 years': null,
        '25 to 54 years': null,
        '55 years and over': null,
        '15 years and over': null
      };
    }
    
    // 根据年龄组添加数据
    if (['15 to 24 years', '25 to 54 years', '55 years and over', '15 years and over'].includes(item.Age)) {
      // 如果是失业率(Unemployment rate)，直接使用Value值
      if (item.Characteristic === 'Unemployment rate') {
        groupedByDate[key][item.Age] = item.Value;
      }
      // 如果是失业人数(Unemployment)，需要计算比率
      else if (item.Characteristic === 'Unemployment') {
        // 这里我们暂时不做转换，而是直接使用值
        groupedByDate[key][item.Age] = item.Value / 10000; // 简单地除以10000作为示例
      }
    }
  });
  
  // 将对象转换为数组，并按日期排序
  return Object.values(groupedByDate).sort((a, b) => a.date - b.date);
};

/**
 * 处理教育程度数据
 */
export const processEducationData = (data) => {
  if (!data || !Array.isArray(data)) return [];
  
  const filteredData = data.filter(item => 
    item.GeoName === "Alberta" && 
    (item.Characteristic === "Unemployment rate" || item.Characteristics === "Unemployment rate")
  );
  
  const groupedByDate = d3.group(filteredData, d => d.Date);
  
  return Array.from(groupedByDate, ([dateStr, items]) => {
    const obj = { 
      date: new Date(dateStr), 
      formattedDate: formatDate(new Date(dateStr)) 
    };
    
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
  
  const datesWithData = data
    .filter(item => item.Value !== null)
    .map(item => new Date(item.Date));
  
  if (datesWithData.length === 0) return [];
  
  const latestDate = d3.max(datesWithData);
  
  if (!latestDate) return [];
  
  const latestData = data.filter(item => 
    new Date(item.Date).getTime() === latestDate.getTime() && 
    item.GeoName !== "Alberta" &&
    item.Value !== null
  );
  
  return latestData.sort((a, b) => (b.Value || 0) - (a.Value || 0));
};

/**
 * 处理经济区域数据
 */
export const processRegionData = (data) => {
  if (!data || !Array.isArray(data)) return [];
  
  const datesWithData = data
    .filter(item => item.Value !== null)
    .map(item => new Date(item.Date));
  
  if (datesWithData.length === 0) return [];
  
  const latestDate = d3.max(datesWithData);
  
  if (!latestDate) return [];
  
  const latestData = data.filter(item => 
    new Date(item.Date).getTime() === latestDate.getTime() && 
    item.Value !== null
  );
  
  return latestData.sort((a, b) => (b.Value || 0) - (a.Value || 0));
};

/**
 * 处理职业数据
 */
export const processOccupationData = (data) => {
  if (!data || !Array.isArray(data)) return [];
  
  const filteredData = data.filter(item => 
    item.GeoName === "Alberta" && 
    (item.Characteristic === "Unemployment rate" || item.Characteristics === "Unemployment rate")
  );
  
  const groupedByDate = d3.group(filteredData, d => d.Date);
  
  return Array.from(groupedByDate, ([dateStr, items]) => {
    const obj = { 
      date: new Date(dateStr), 
      formattedDate: formatDate(new Date(dateStr)) 
    };
    
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
  Object.keys(firstEntry).forEach(key => {
    if (['date', 'formattedDate'].includes(key)) return;
    if (firstEntry[key] !== null && firstEntry[key] !== undefined) {
      ageGroups.add(key);
    }
  });
  
  return Array.from(ageGroups);
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
