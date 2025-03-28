import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const SalaryChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOccupations, setSelectedOccupations] = useState([]);
  const [selectedProvinces, setSelectedProvinces] = useState(['NAT', 'ON', 'AB', 'BC', 'QC']);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('./data/salary.json');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(jsonData);
        
        // 设置默认选择的职业（按平均薪资排名前5）
        const uniqueOccupations = [...new Set(jsonData.map(item => item.NOC_Title_eng))];
        const topOccupations = uniqueOccupations
          .slice(0, 5);
        setSelectedOccupations(topOccupations);
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to load salary data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOccupationSelection = (occupation) => {
    if (selectedOccupations.includes(occupation)) {
      setSelectedOccupations(selectedOccupations.filter(o => o !== occupation));
    } else {
      setSelectedOccupations([...selectedOccupations, occupation]);
    }
  };

  const handleProvinceSelection = (province) => {
    if (selectedProvinces.includes(province)) {
      setSelectedProvinces(selectedProvinces.filter(p => p !== province));
    } else {
      setSelectedProvinces([...selectedProvinces, province]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="mb-4">Loading salary data...</div>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-bold text-lg mb-4">Salary Data</h2>
        <div className="text-red-500">Error loading data: {error}</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-bold text-lg mb-4">Salary Data</h2>
        <div>No data available</div>
      </div>
    );
  }

  // 按职业类型获取全国数据
  const getNationalOccupationData = () => {
    const nationalData = data.filter(item => item.prov === 'NAT');
    
    // 按平均薪资排序
    return nationalData
      .filter(item => item.Average_Wage_Salaire_Moyen !== null)
      .sort((a, b) => b.Average_Wage_Salaire_Moyen - a.Average_Wage_Salaire_Moyen)
      .slice(0, 20); // 只取前20个职业
  };

  // 获取各省份平均薪资比较
  const getProvincialAverageData = () => {
    // 获取所有独特的省份代码
    const provinces = [...new Set(data.map(item => item.prov))].filter(p => p !== 'NAT');
    
    // 计算每个省份的平均薪资
    const result = provinces.map(prov => {
      const provincialData = data.filter(item => item.prov === prov);
      const totalSalary = provincialData.reduce((sum, item) => {
        return sum + (item.Average_Wage_Salaire_Moyen || 0);
      }, 0);
      
      const provinceName = provincialData[0]?.ER_Name || prov;
      
      return {
        province: prov,
        provinceName,
        averageSalary: totalSalary / provincialData.length
      };
    });
    
    return result
      .filter(item => !isNaN(item.averageSalary) && item.averageSalary > 0)
      .sort((a, b) => b.averageSalary - a.averageSalary);
  };

  // 按职业和省份获取薪资比较数据
  const getOccupationByProvinceData = () => {
    if (selectedOccupations.length === 0) return [];
    
    const filteredData = data.filter(item => 
      selectedOccupations.includes(item.NOC_Title_eng) &&
      selectedProvinces.includes(item.prov)
    );
    
    return filteredData.map(item => ({
      occupation: item.NOC_Title_eng,
      province: item.prov,
      provinceName: item.ER_Name,
      averageSalary: item.Average_Wage_Salaire_Moyen,
      medianSalary: item.Median_Wage_Salaire_Median,
      lowSalary: item.Low_Wage_Salaire_Minium,
      highSalary: item.High_Wage_Salaire_Maximal
    }));
  };

  // 获取薪资范围数据
  const getSalaryRangeData = () => {
    const nationalData = data.filter(item => item.prov === 'NAT');
    
    return nationalData
      .filter(item => 
        item.Low_Wage_Salaire_Minium !== null && 
        item.High_Wage_Salaire_Maximal !== null
      )
      .sort((a, b) => b.Median_Wage_Salaire_Median - a.Median_Wage_Salaire_Median)
      .slice(0, 15) // 只取前15个职业
      .map(item => ({
        occupation: item.NOC_Title_eng.length > 30 
          ? item.NOC_Title_eng.substring(0, 30) + '...' 
          : item.NOC_Title_eng,
        low: item.Low_Wage_Salaire_Minium,
        q1: item.Quartile1_Wage_Salaire_Quartile1,
        median: item.Median_Wage_Salaire_Median,
        q3: item.Quartile3_Wage_Salaire_Quartile3,
        high: item.High_Wage_Salaire_Maximal,
        average: item.Average_Wage_Salaire_Moyen
      }));
  };

  // 获取可选择的所有职业
  const getAvailableOccupations = () => {
    const uniqueOccupations = [...new Set(data.map(item => item.NOC_Title_eng))];
    return uniqueOccupations.sort();
  };

  // 获取可选择的所有省份
  const getAvailableProvinces = () => {
    return [...new Set(data.map(item => item.prov))].map(prov => {
      const provinceName = data.find(item => item.prov === prov)?.ER_Name || prov;
      return { code: prov, name: provinceName };
    }).sort((a, b) => {
      // 确保NAT（全国）排在最前面
      if (a.code === 'NAT') return -1;
      if (b.code === 'NAT') return 1;
      return a.name.localeCompare(b.name);
    });
  };

  // 自定义工具提示
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: $${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 渲染概览标签页
  const renderOverviewTab = () => (
    <div>
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Highest Paying Occupations in Canada (2021)</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getNationalOccupationData()}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <YAxis 
                type="category" 
                dataKey="NOC_Title_eng" 
                width={180}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar 
                dataKey="Average_Wage_Salaire_Moyen" 
                name="Average Salary (CAD)" 
                fill="#8884d8" 
              />
              <Bar 
                dataKey="Median_Wage_Salaire_Median" 
                name="Median Salary (CAD)" 
                fill="#82ca9d" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Average Salary by Province (2021)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getProvincialAverageData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="provinceName" />
              <YAxis 
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                label={{ value: 'Average Salary (CAD)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar 
                dataKey="averageSalary" 
                name="Average Salary (CAD)" 
                fill="#0088FE" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Salary Ranges by Occupation (2021)</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getSalaryRangeData()}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <YAxis 
                type="category" 
                dataKey="occupation" 
                width={180}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar 
                dataKey="low" 
                name="Minimum" 
                stackId="a" 
                fill="#8884d8" 
              />
              <Bar 
                dataKey="median" 
                name="Median" 
                stackId="a" 
                fill="#82ca9d" 
              />
              <Bar 
                dataKey="high" 
                name="Maximum" 
                stackId="a" 
                fill="#ffc658" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // 渲染职业比较标签页
  const renderOccupationTab = () => (
    <div>
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Select Occupations to Compare</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Choose occupations:</p>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded">
            {getAvailableOccupations().map((occupation) => (
              <div
                key={occupation}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                  selectedOccupations.includes(occupation) 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-500'
                }`}
                onClick={() => handleOccupationSelection(occupation)}
              >
                {occupation.length > 30 ? occupation.substring(0, 30) + '...' : occupation}
              </div>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Choose provinces:</p>
          <div className="flex flex-wrap gap-2">
            {getAvailableProvinces().map((province) => (
              <div
                key={province.code}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                  selectedProvinces.includes(province.code) 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-500'
                }`}
                onClick={() => handleProvinceSelection(province.code)}
              >
                {province.name}
              </div>
            ))}
          </div>
        </div>

        <div className="h-96 mt-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getOccupationByProvinceData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="occupation" 
                tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
                height={100}
              />
              <YAxis 
                tickFormatter={(value) => `$${value/1000}k`}
                label={{ value: 'Salary (CAD)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              {selectedProvinces.map((province, index) => {
                const provinceName = getAvailableProvinces().find(p => p.code === province)?.name || province;
                return (
                  <Bar
                    key={province}
                    dataKey="averageSalary"
                    name={provinceName}
                    fill={COLORS[index % COLORS.length]}
                    stackId={province}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // 渲染详细数据标签页
  const renderDetailedTab = () => (
    <div>
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Detailed Salary Statistics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b border-r text-left">Occupation</th>
                <th className="py-2 px-4 border-b border-r text-left">Province</th>
                <th className="py-2 px-4 border-b border-r text-right">Low</th>
                <th className="py-2 px-4 border-b border-r text-right">Median</th>
                <th className="py-2 px-4 border-b border-r text-right">Average</th>
                <th className="py-2 px-4 border-b text-right">High</th>
              </tr>
            </thead>
            <tbody>
              {data
                .filter(item => item.prov === 'NAT')
                .sort((a, b) => b.Average_Wage_Salaire_Moyen - a.Average_Wage_Salaire_Moyen)
                .slice(0, 20)
                .map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-2 px-4 border-b border-r">{item.NOC_Title_eng}</td>
                    <td className="py-2 px-4 border-b border-r">{item.ER_Name}</td>
                    <td className="py-2 px-4 border-b border-r text-right">
                      {item.Low_Wage_Salaire_Minium === null 
                        ? 'N/A' 
                        : `$${item.Low_Wage_Salaire_Minium.toLocaleString()}`}
                    </td>
                    <td className="py-2 px-4 border-b border-r text-right">
                      {item.Median_Wage_Salaire_Median === null 
                        ? 'N/A' 
                        : `$${item.Median_Wage_Salaire_Median.toLocaleString()}`}
                    </td>
                    <td className="py-2 px-4 border-b border-r text-right">
                      {item.Average_Wage_Salaire_Moyen === null 
                        ? 'N/A' 
                        : `$${item.Average_Wage_Salaire_Moyen.toLocaleString()}`}
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      {item.High_Wage_Salaire_Maximal === null 
                        ? 'N/A' 
                        : `$${item.High_Wage_Salaire_Maximal.toLocaleString()}`}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-xl">Canadian Salary Analysis</h2>
        <div className="text-sm text-gray-500">
          Data Source: 2021 Census
        </div>
      </div>

      <div className="mb-6 border-b">
        <div className="flex">
          <button
            className={`pb-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === 'occupation' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('occupation')}
          >
            Compare Occupations
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === 'detailed' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('detailed')}
          >
            Detailed Data
          </button>
        </div>
      </div>

      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'occupation' && renderOccupationTab()}
        {activeTab === 'detailed' && renderDetailedTab()}
      </div>

      <div className="text-xs text-gray-500 mt-6">
        Data Source: Statistics Canada. 2021 Census of Population.
      </div>
    </div>
  );
};

export default SalaryChart;