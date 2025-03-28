import React, { useState, useEffect, useMemo } from 'react';
import * as dataUtils from './utils/dataProcessing';
import { 
  filterByTimeframe, 
  getAvailableIndustries,
  getAvailableProvinces 
} from './utils/dataProcessing';

// Import all chart components
import AlbertaOverviewChart from './charts/AlbertaOverviewChart';
import ProvinceChart from './charts/ProvinceChart';
import IndustryChart from './charts/IndustryChart';
import SexChart from './charts/SexChart';
import AgeChart from './charts/AgeChart';
import CMAChart from './charts/CMAChart';
import EducationChart from './charts/EducationChart';
import RegionChart from './charts/RegionChart';
import OccupationChart from './charts/OccupationChart';
import EnhancedRegionChart from './charts/EnhancedRegionChart';

const Dashboard = (props) => {
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
  const [selectedTimeframe, setSelectedTimeframe] = useState('10 Years');
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedProvinces, setSelectedProvinces] = useState(['Alberta', 'Canada', 'British Columbia', 'Ontario']);
  const [selectedIndustries, setSelectedIndustries] = useState(['Total, all industries', 'Construction [23]']);

  // 时间范围映射
  const timeframeMapping = {
    '1 Year': '1y',
    '3 Years': '3y',
    '5 Years': '5y',
    '10 Years': '10y',
    'All Data': 'all'
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

  // For debugging, let's log the data to see if it's available
  useEffect(() => {
    if (!loading) {
      console.log("Data loaded:", {
        albertaData: albertaData.length,
        provinceData: provinceData.length,
        industryData: industryData.length,
        sexData: sexData.length,
        ageData: ageData.length,
        educationData: educationData.length,
        cityData: cityData.length,
        regionData: regionData.length,
        occupationData: occupationData.length
      });

      // Log sample data for debugging
      if (filteredSexData.length > 0) {
        console.log("Sample Sex Data:", filteredSexData[0]);
      }

      if (filteredAgeData.length > 0) {
        console.log("Sample Age Data:", filteredAgeData[0]);
      }
    }
  }, [loading, albertaData, provinceData, industryData, sexData, ageData, educationData, cityData, regionData, occupationData, filteredSexData, filteredAgeData]);

  // 添加调试信息，查看Tab切换是否正常工作
  useEffect(() => {
    console.log("Active tab:", activeTab);
    if (activeTab === 'Industry & Occupation') {
      console.log("Industry data available:", filteredIndustryData.length > 0);
      console.log("Selected industries:", selectedIndustries);
    }
  }, [activeTab, filteredIndustryData, selectedIndustries]);

  // Handle province and industry selection
  const handleProvinceSelection = (province) => {
    if (selectedProvinces.includes(province)) {
      setSelectedProvinces(selectedProvinces.filter(p => p !== province));
    } else {
      setSelectedProvinces([...selectedProvinces, province]);
    }
  };

  const handleIndustrySelection = (industry) => {
    if (selectedIndustries.includes(industry)) {
      setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
    } else {
      setSelectedIndustries([...selectedIndustries, industry]);
    }
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="mb-4">Loading unemployment data...</div>
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
          <div className="text-xl mb-2">Error</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  // Content for the dashboard tabs
  const renderOverviewTab = () => (
    <>
      <div className="mb-6">
        <AlbertaOverviewChart
          data={filteredAlbertaData}
          timeframe={getTimeframeValue(selectedTimeframe)}
        />
      </div>

      <div className="mb-6">
        <ProvinceChart
          data={filteredProvinceData}
          selectedProvinces={selectedProvinces}
          onProvinceSelection={handleProvinceSelection}
        />
      </div>
    </>
  );

  const renderIndustryTab = () => (
    <>
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 className="font-bold text-lg mb-4">Industry Unemployment Trends</h2>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">选择行业查看失业率趋势:</p>
          <div className="flex flex-wrap gap-2">
            {dataUtils.getAvailableIndustries(filteredIndustryData).map(industry => (
              <div
                key={industry}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                  selectedIndustries.includes(industry) 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-500'
                }`}
                onClick={() => handleIndustrySelection(industry)}
              >
                {industry.length > 25 ? industry.substring(0, 25) + '...' : industry}
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: '400px' }}>
          <IndustryChart
            data={filteredIndustryData}
            selectedIndustries={selectedIndustries}
            onIndustrySelection={handleIndustrySelection}
          />
        </div>
      </div>
      <div className="mb-6">
        <OccupationChart
          data={filteredOccupationData}
          timeframe={getTimeframeValue(selectedTimeframe)}
        />
      </div>
    </>
  );

  const renderDemographicTab = () => (
    <>
      <div className="mb-6">
        <SexChart data={filteredSexData} />
      </div>
      <div className="mb-6">
        <AgeChart data={filteredAgeData} />
      </div>
      <div className="mb-6">
        <EducationChart data={filteredEducationData} />
      </div>
    </>
  );

  const renderGeographicTab = () => (
    <>
      {/* <div className="mb-6">
        <EnhancedCMAChart data={cityData} />
      </div> */}
      <div className="mb-6">
        <CMAChart data={cityData} />
      </div>
      <div className="mb-6">
        <RegionChart data={regionData} />
      </div>
      <div className="mb-6">
        <EnhancedRegionChart data={regionData} />
      </div>
    </>
  );

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Canada Unemployment Dashboard</h1>

      {/* 时间范围选择器 */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <div className="font-medium">Time Range:</div>
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
            className={`pb-2 px-4 ${activeTab === 'Overview' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('Overview')}
          >
            Overview
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === 'Industry & Occupation' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('Industry & Occupation')}
          >
            Industry & Occupation
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === 'Demographics' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('Demographics')}
          >
            Demographics
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === 'Geography' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('Geography')}
          >
            Geography
          </button>
        </div>
      </div>

      {/* 标签页内容 */}
      <div className="mt-6">
        {activeTab === 'Overview' && renderOverviewTab()}
        {activeTab === 'Industry & Occupation' && renderIndustryTab()}
        {activeTab === 'Demographics' && renderDemographicTab()}
        {activeTab === 'Geography' && renderGeographicTab()}
      </div>
      
      {/* 导航按钮区域 */}
      <div className="mt-12 mb-6 text-center flex justify-center space-x-4">
        <button 
          onClick={() => props.onNavigate('jobVacancy')} 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
        >
          View Job Vacancy Analysis
        </button>
        <button 
          onClick={() => props.onNavigate('salary')} 
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded"
        >
          View Salary Analysis
        </button>
      </div>

      <div className="text-sm text-gray-500 mt-8">
        Data Source: Statistics Canada. Labour force Survey
      </div>
    </div>
  );
};

export default Dashboard;