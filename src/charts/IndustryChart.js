import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartContainer from '../components/ChartContainer';
import { filterByTimeframe, getAvailableIndustries } from '../utils/dataProcessing';
import { industryColorScale } from '../utils/colorScales';

/**
 * 行业失业率对比图表
 * 
 * @param {Object} props
 * @param {Array} props.data - 行业失业率数据
 * @param {string} props.timeframe - 选中的时间范围
 * @returns {React.ReactElement} 行业失业率对比组件
 */
const IndustryChart = ({ data, timeframe }) => {
  const [selectedIndustries, setSelectedIndustries] = useState(['Total, all industries', 'Construction']);
  
  const filteredData = filterByTimeframe(data, timeframe);
  
  if (!filteredData || filteredData.length === 0) {
    return null;
  }
  
  // 当数据变化时，更新默认选中的行业
  useEffect(() => {
    if (data && data.length > 0) {
      const availableIndustries = getAvailableIndustries(data);
      
      // 设置默认选中的行业
      const defaultIndustries = [];
      
      // 尝试找到常见行业类别
      const industryOptions = [
        "Total, all industries", 
        "Goods-producing sector",
        "Construction",
        "Manufacturing", 
        "Services-producing sector"
      ];
      
      // 添加存在于数据中的行业
      industryOptions.forEach(option => {
        if (availableIndustries.includes(option)) {
          defaultIndustries.push(option);
        }
      });
      
      // 如果找不到首选行业，使用前几个可用的
      if (defaultIndustries.length === 0 && availableIndustries.length > 0) {
        defaultIndustries.push(availableIndustries[0]);
        if (availableIndustries.length > 1) {
          defaultIndustries.push(availableIndustries[1]);
        }
      }
      
      // 如果找到有效选择，更新状态
      if (defaultIndustries.length > 0) {
        setSelectedIndustries(defaultIndustries);
      }
    }
  }, [data]);

  // 处理行业选择变化
  const handleIndustrySelection = (industry) => {
    if (selectedIndustries.includes(industry)) {
      setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
    } else {
      setSelectedIndustries([...selectedIndustries, industry]);
    }
  };

  // 生成行业筛选器
  const industryFilters = (
    <>
      {getAvailableIndustries(data).slice(0, 10).map(industry => (
        <div
          key={industry}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
            selectedIndustries.includes(industry) 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-500'
          }`}
          onClick={() => handleIndustrySelection(industry)}
        >
          {industry.length > 20 ? industry.substring(0, 20) + '...' : industry}
        </div>
      ))}
    </>
  );

  return (
    <ChartContainer 
      title="行业失业率对比" 
      filters={industryFilters}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={filteredData}
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
              name={industry.length > 20 ? industry.substring(0, 20) + '...' : industry}
              stroke={industryColorScale(industry)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default IndustryChart;
