import React, { useState, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import * as dataUtils from './utils/dataProcessing';

const Dashboard = () => {
  // 状态变量
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [albertaData, setAlbertaData] = useState([]);
  const [provinceData, setProvinceData] = useState([]);
  const [industryData, setIndustryData] = useState([]);
  const [sexData, setSexData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [educationData, setEducationData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [occupationData, setOccupationData] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('10年');
  const [activeTab, setActiveTab] = useState('概览');
  const [selectedProvinces, setSelectedProvinces] = useState(['Alberta', 'Canada', 'British Columbia', 'Ontario']);
  const [selectedIndustries, setSelectedIndustries] = useState(['Total, all industries', 'Construction']);

  // 省份颜色比例尺
  const provinceColorScale = d3.scaleOrdinal()
    .domain(['Alberta', 'Canada', 'British Columbia', 'Ontario', 'Quebec'])
    .range(['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC']);

  // 工业颜色比例尺
  const industryColorScale = d3.scaleOrdinal()
    .domain(['Total, all industries', 'Construction', 'Manufacturing', 'Professional, scientific and technical services'])
    .range(['#4285F4', '#DB4437', '#F4B400', '#0F9D58']);

  // 时间范围映射
  const timeframeMapping = {
    '1年': '1y',
    '3年': '3y',
    '5年': '5y',
    '10年': '10y',
    '全部数据': 'all'
  };

  // 获取英文时间范围值
  const getTimeframeValue = (label) => {
    return timeframeMapping[label] || '10y';
  };

  // 加载数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 加载本地JSON文件
        const loadLocalFile = async (filename) => {
          try {
            const response = await fetch(`./data/${filename}.json`);
            const data = await response.json();
            return Array.isArray(data) ? data : [data];
          } catch (err) {
            console.error(`Error loading ${filename}.json:`, err);
            return [];
          }
        };

        // 并行加载所有数据
        const [alberta, province, industry, sex, age, city, education, region, occupation] = await Promise.all([
          loadLocalFile('alberta'),
          loadLocalFile('province'),
          loadLocalFile('industry'),
          loadLocalFile('sex'),
          loadLocalFile('age'),
          loadLocalFile('city'),
          loadLocalFile('education'),
          loadLocalFile('region'),
          loadLocalFile('occupation')
        ]);

        // 处理和格式化数据
        const processedAlbertaData = dataUtils.processAlbertaData(alberta);
        const processedProvinceData = dataUtils.processProvinceData(province);
        const processedIndustryData = dataUtils.processIndustryData(industry);
        const processedSexData = dataUtils.processSexData(sex);
        const processedAgeData = dataUtils.processAgeData(age);
        const processedCityData = dataUtils.processCMAData(city);
        const processedEducationData = dataUtils.processEducationData(education);
        const processedRegionData = dataUtils.processRegionData(region);
        const processedOccupationData = dataUtils.processOccupationData(occupation);

        setAlbertaData(processedAlbertaData);
        setProvinceData(processedProvinceData);
        setIndustryData(processedIndustryData);
        setSexData(processedSexData);
        setAgeData(processedAgeData);
        setCityData(processedCityData);
        setEducationData(processedEducationData);
        setRegionData(processedRegionData);
        setOccupationData(processedOccupationData);

        setLoading(false);
      } catch (err) {
        console.error("Data loading error:", err);
        setError("Failed to load data: " + err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 处理省份选择
  const handleProvinceSelection = (province) => {
    if (selectedProvinces.includes(province)) {
      setSelectedProvinces(selectedProvinces.filter(p => p !== province));
    } else {
      setSelectedProvinces([...selectedProvinces, province]);
    }
  };

  // 处理行业选择
  const handleIndustrySelection = (industry) => {
    if (selectedIndustries.includes(industry)) {
      setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
    } else {
      setSelectedIndustries([...selectedIndustries, industry]);
    }
  };

  // 基于时间范围过滤数据
  const filteredAlbertaData = useMemo(() => {
    return dataUtils.filterByTimeframe(albertaData, getTimeframeValue(selectedTimeframe));
  }, [albertaData, selectedTimeframe]);

  const filteredProvinceData = useMemo(() => {
    return dataUtils.filterByTimeframe(provinceData, getTimeframeValue(selectedTimeframe));
  }, [provinceData, selectedTimeframe]);

  const filteredIndustryData = useMemo(() => {
    return dataUtils.filterByTimeframe(industryData, getTimeframeValue(selectedTimeframe));
  }, [industryData, selectedTimeframe]);

  const filteredSexData = useMemo(() => {
    return dataUtils.filterByTimeframe(sexData, getTimeframeValue(selectedTimeframe));
  }, [sexData, selectedTimeframe]);

  const filteredAgeData = useMemo(() => {
    return dataUtils.filterByTimeframe(ageData, getTimeframeValue(selectedTimeframe));
  }, [ageData, selectedTimeframe]);

  const filteredEducationData = useMemo(() => {
    return dataUtils.filterByTimeframe(educationData, getTimeframeValue(selectedTimeframe));
  }, [educationData, selectedTimeframe]);

  const filteredOccupationData = useMemo(() => {
    return dataUtils.filterByTimeframe(occupationData, getTimeframeValue(selectedTimeframe));
  }, [occupationData, selectedTimeframe]);

  // 渲染加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="mb-4">加载失业率数据...</div>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <div className="text-xl mb-2">错误</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  // 渲染Alberta总览图表
  const renderAlbertaOverview = () => {
    if (!filteredAlbertaData || filteredAlbertaData.length === 0) return null;

    // 获取当前、最小、最大值
    const currentValue = filteredAlbertaData[filteredAlbertaData.length - 1].value;
    const minValue = d3.min(filteredAlbertaData, d => d.value);
    const maxValue = d3.max(filteredAlbertaData, d => d.value);

    // 计算同比变化
    const currentDate = filteredAlbertaData[filteredAlbertaData.length - 1].date;
    const lastYearDate = new Date(currentDate);
    lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);

    const lastYearValue = filteredAlbertaData.find(d =>
      d.date.getFullYear() === lastYearDate.getFullYear() &&
      d.date.getMonth() === lastYearDate.getMonth()
    )?.value;

    const yoyChange = lastYearValue ? (currentValue - lastYearValue) : null;

    const chartData = filteredAlbertaData.map(d => ({
      date: d.formattedDate,
      value: d.value
    }));

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500 mb-1">当前失业率</div>
            <div className="text-2xl font-bold">{currentValue.toFixed(1)}%</div>
            {yoyChange !== null && (
              <div className={`text-sm ${yoyChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
                比去年{yoyChange < 0 ? '下降' : '上升'} {Math.abs(yoyChange).toFixed(1)}%
              </div>
            )}
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500 mb-1">期间最低值</div>
            <div className="text-2xl font-bold">{minValue.toFixed(1)}%</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500 mb-1">期间最高值</div>
            <div className="text-2xl font-bold">{maxValue.toFixed(1)}%</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="font-bold text-lg mb-4">Alberta失业率趋势</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => value.split('-')[0]}
                  minTickGap={60}
                />
                <YAxis
                  domain={[0, 'auto']}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, '失业率']} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4285F4"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    );
  };

  // 渲染省份对比图表
  const renderProvinceComparison = () => {
    if (!filteredProvinceData || filteredProvinceData.length === 0) return null;

    // 获取可用省份
    const availableProvinces = dataUtils.getAvailableProvinces(provinceData);

    // 定义省份中文映射
    const provinceNameMap = {
      'Alberta': 'Alberta',
      'Canada': 'Canada',
      'British Columbia': 'British Columbia',
      'Ontario': 'Ontario',
      'Quebec': 'Quebec',
      'Manitoba': 'Manitoba',
      'Saskatchewan': 'Saskatchewan',
      'Nova Scotia': 'Nova Scotia',
      'New Brunswick': 'New Brunswick',
      'Newfoundland and Labrador': 'Newfoundland and Labrador',
      'Prince Edward Island': 'Prince Edward Island'
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="font-bold text-lg mb-2">省份失业率对比</div>
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          {availableProvinces.map(province => (
            <div
              key={province}
              className={`px-3 py-1 rounded-full text-sm cursor-pointer ${selectedProvinces.includes(province)
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-500'
                }`}
              onClick={() => handleProvinceSelection(province)}
            >
              {provinceNameMap[province] || province}
            </div>
          ))}
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredProvinceData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="formattedDate"
                tickFormatter={(value) => value.split('-')[0]}
                minTickGap={60}
              />
              <YAxis
                domain={[0, 'auto']}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value) => [`${value.toFixed(1)}%`, '失业率']}
                labelFormatter={(label) => label}
              />
              <Legend formatter={(value) => provinceNameMap[value] || value} />
              {selectedProvinces.map(province => (
                <Line
                  key={province}
                  type="monotone"
                  dataKey={province}
                  name={province}
                  stroke={provinceColorScale(province)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // 渲染行业对比图表
  const renderIndustryComparison = () => {
    if (!filteredIndustryData || filteredIndustryData.length === 0) return null;

    const availableIndustries = dataUtils.getAvailableIndustries(industryData);

    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="font-bold text-lg mb-2">行业失业率对比</div>
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          {availableIndustries.slice(0, 8).map(industry => (
            <div
              key={industry}
              className={`px-3 py-1 rounded-full text-sm cursor-pointer ${selectedIndustries.includes(industry)
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-500'
                }`}
              onClick={() => handleIndustrySelection(industry)}
            >
              {industry.length > 20 ? industry.substring(0, 20) + '...' : industry}
            </div>
          ))}
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredIndustryData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="formattedDate"
                tickFormatter={(value) => value.split('-')[0]}
                minTickGap={60}
              />
              <YAxis
                domain={[0, 'auto']}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value) => [`${value.toFixed(1)}%`, '失业率']}
                labelFormatter={(label) => label}
              />
              <Legend />
              {selectedIndustries.map(industry => (
                <Line
                  key={industry}
                  type="monotone"
                  dataKey={industry}
                  name={industry.length > 25 ? industry.substring(0, 25) + '...' : industry}
                  stroke={industryColorScale(industry)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // 渲染性别对比图表
  const renderSexComparison = () => {
    if (!filteredSexData || filteredSexData.length === 0) return null;

    // 性别名称映射
    const sexNameMap = {
      'Male': '男性',
      'Female': '女性',
      'Both sexes': '总体'
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="font-bold text-lg mb-2">性别失业率对比</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredSexData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="formattedDate"
                tickFormatter={(value) => value.split('-')[0]}
                minTickGap={60}
              />
              <YAxis
                domain={[0, 'auto']}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value) => [`${value.toFixed(1)}%`, '失业率']}
                labelFormatter={(label) => label}
              />
              <Legend formatter={(value) => sexNameMap[value] || value} />
              <Line
                type="monotone"
                dataKey="Male"
                name="Male"
                stroke="#1E88E5"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Female"
                name="Female"
                stroke="#D81B60"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              {filteredSexData[0] && filteredSexData[0]['Both sexes'] !== undefined && (
                <Line
                  type="monotone"
                  dataKey="Both sexes"
                  name="Both sexes"
                  stroke="#8E24AA"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // 渲染年龄组对比图表
  const renderAgeComparison = () => {
    if (!filteredAgeData || filteredAgeData.length === 0) return null;

    // 获取可用年龄组
    const ageGroups = dataUtils.getAvailableAgeGroups(filteredAgeData);

    // 年龄组名称映射
    const ageNameMap = {
      '15 to 24 years': '15-24岁',
      '25 to 54 years': '25-54岁',
      '55 years and over': '55岁以上',
      '15 years and over': '15岁以上（总体）'
    };

    // 年龄组颜色映射
    const ageColorMap = {
      '15 to 24 years': '#F44336',
      '25 to 54 years': '#2196F3',
      '55 years and over': '#4CAF50',
      '15 years and over': '#9C27B0'
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="font-bold text-lg mb-2">年龄组失业率对比</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredAgeData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="formattedDate"
                tickFormatter={(value) => value.split('-')[0]}
                minTickGap={60}
              />
              <YAxis
                domain={[0, 'auto']}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value) => [`${value.toFixed(1)}%`, '失业率']}
                labelFormatter={(label) => label}
              />
              <Legend formatter={(value) => ageNameMap[value] || value} />
              {ageGroups.map(ageGroup => (
                <Line
                  key={ageGroup}
                  type="monotone"
                  dataKey={ageGroup}
                  name={ageGroup}
                  stroke={ageColorMap[ageGroup] || '#000000'}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // 渲染教育程度对比图表
  const renderEducationComparison = () => {
    if (!filteredEducationData || filteredEducationData.length === 0) return null;

    // 获取可用教育程度
    const educationLevels = dataUtils.getAvailableEducationLevels(filteredEducationData);

    // 教育程度颜色映射
    const educationColorMap = {
      'Less than high school': '#795548',
      'High school graduate': '#FF9800',
      'Some postsecondary': '#FFEB3B',
      'Postsecondary certificate or diploma': '#03A9F4',
      'University degree': '#673AB7',
      'Total, all education levels': '#4285F4'
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="font-bold text-lg mb-2">教育程度失业率对比</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredEducationData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="formattedDate"
                tickFormatter={(value) => value.split('-')[0]}
                minTickGap={60}
              />
              <YAxis
                domain={[0, 'auto']}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value) => [`${value.toFixed(1)}%`, '失业率']}
                labelFormatter={(label) => label}
              />
              <Legend />
              {educationLevels.map(level => (
                <Line
                  key={level}
                  type="monotone"
                  dataKey={level}
                  name={level.length > 25 ? level.substring(0, 25) + '...' : level}
                  stroke={educationColorMap[level] || '#000000'}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // 渲染职业对比图表
  const renderOccupationComparison = () => {
    if (!filteredOccupationData || filteredOccupationData.length === 0) return null;

    // 获取可用职业，限制为前5个以避免图表过于复杂
    const availableOccupations = dataUtils.getAvailableOccupations(filteredOccupationData).slice(0, 5);

    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="font-bold text-lg mb-2">职业失业率对比</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredOccupationData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="formattedDate"
                tickFormatter={(value) => value.split('-')[0]}
                minTickGap={60}
              />
              <YAxis
                domain={[0, 'auto']}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value) => [`${value.toFixed(1)}%`, '失业率']}
                labelFormatter={(label) => label}
              />
              <Legend />
              {availableOccupations.map((occupation, index) => (
                <Line
                  key={occupation}
                  type="monotone"
                  dataKey={occupation}
                  name={occupation.length > 25 ? occupation.substring(0, 25) + '...' : occupation}
                  stroke={d3.schemeCategory10[index % 10]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // 渲染城市对比图表
  const renderCityComparison = () => {
    if (!cityData || cityData.length === 0) return null;

    // 格式化为图表数据
    const chartData = cityData.map(city => ({
      city: city.GeoName,
      value: city.Value || 0
    }));

    const dateDateStr = cityData.length > 0 ? new Date(cityData[0].Date).toLocaleDateString() : '';

    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="font-bold text-lg mb-2">城市失业率对比</div>
        <div className="text-sm text-gray-500 mb-4">
          最新数据: {dateDateStr}
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[0, 'dataMax + 1']}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="city"
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, '失业率']} />
              <Bar
                dataKey="value"
                fill="#4285F4"
                label={{
                  position: 'right',
                  formatter: (value) => `${value.toFixed(1)}%`,
                  fill: '#000000'
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // 渲染经济区域对比图表
  const renderRegionComparison = () => {
    if (!regionData || regionData.length === 0) return null;

    // 格式化为图表数据
    const chartData = regionData.map(region => ({
      region: region.GeoName,
      value: region.Value || 0
    }));

    const dateDateStr = regionData.length > 0 ? new Date(regionData[0].Date).toLocaleDateString() : '';

    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="font-bold text-lg mb-2">Alberta区域失业率对比</div>
        <div className="text-sm text-gray-500 mb-4">
          最新数据: {dateDateStr}
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[0, 'dataMax + 1']}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="region"
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, '失业率']} />
              <Bar
                dataKey="value"
                fill="#AB47BC"
                label={{
                  position: 'right',
                  formatter: (value) => `${value.toFixed(1)}%`,
                  fill: '#000000'
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Alberta失业率仪表盘</h1>

      {/* 时间范围选择器 */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <div className="font-medium">时间范围:</div>
          <div className="flex space-x-2 flex-wrap">
            {Object.keys(timeframeMapping).map(tf => (
              <button
                key={tf}
                className={`px-3 py-1 rounded-md text-sm ${selectedTimeframe === tf
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                onClick={() => setSelectedTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 标签页切换 */}
      <div className="mb-6 border-b">
        <div className="flex flex-wrap">
          <button
            className={`pb-2 px-4 ${activeTab === '概览' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('概览')}
          >
            概览
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === '行业与职业' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('行业与职业')}
          >
            行业与职业
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === '人口特征' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('人口特征')}
          >
            人口特征
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === '地理区域' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('地理区域')}
          >
            地理区域
          </button>
        </div>
      </div>

      {/* 标签页内容 */}
      <div className="mt-6">
        {activeTab === '概览' && (
          <>
            {renderAlbertaOverview()}
            {renderProvinceComparison()}
          </>
        )}

        {activeTab === '行业与职业' && (
          <>
            {renderIndustryComparison()}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {renderOccupationComparison()}
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="font-bold text-lg mb-4">行业分布</div>
                <div className="h-72 flex items-center justify-center">
                  <div className="text-gray-500">
                    该图表展示各行业就业分布，数据正在准备中...
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === '人口特征' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {renderSexComparison()}
              {renderAgeComparison()}
            </div>
            {renderEducationComparison()}
          </>
        )}

        {activeTab === '地理区域' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
              {renderCityComparison()}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
              {renderRegionComparison()}
            </div>
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="font-bold text-lg mb-4">Alberta地区失业率地图</div>
              <div className="h-96 flex items-center justify-center">
                <div className="text-gray-500">
                  地图视图正在开发中...
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="text-sm text-gray-500 mt-8">
        数据来源: Alberta Economic Dashboard (api.economicdata.alberta.ca)
      </div>
    </div>
  );
};

export default Dashboard;