import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartContainer from '../components/ChartContainer';
import { getAvailableIndustries } from '../utils/dataProcessing';

/**
 * 行业失业率对比图表
 * 
 * @param {Object} props
 * @param {Array} props.data - 行业失业率数据
 * @param {Array} props.selectedIndustries - 选中的行业
 * @param {Function} props.onIndustrySelection - 行业选择回调函数
 * @returns {React.ReactElement} 行业失业率对比组件
 */
const IndustryChart = ({ data, selectedIndustries, onIndustrySelection }) => {
  if (!data || data.length === 0) {
    console.log("IndustryChart: No data provided");
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">No industry data available</div>
      </div>
    );
  }
  
  console.log("IndustryChart data:", data.slice(0, 2));
  console.log("Selected industries:", selectedIndustries);

  // 获取可用行业
  const availableIndustries = getAvailableIndustries(data);
  
  // 检查选中的行业是否在可用行业中
  const validSelectedIndustries = selectedIndustries.filter(industry => 
    availableIndustries.includes(industry)
  );
  
  // 生成行业筛选器
  const industryFilters = (
    <div className="flex flex-wrap gap-2 mt-2">
      {availableIndustries.map(industry => (
        <div
          key={industry}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
            selectedIndustries.includes(industry) 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-500'
          }`}
          onClick={() => onIndustrySelection(industry)}
        >
          {industry.length > 25 ? industry.substring(0, 25) + '...' : industry}
        </div>
      ))}
    </div>
  );

  // 颜色映射
  const getIndustryColor = (industry) => {
    const colors = {
      'Total, all industries': '#4285F4',
      'Construction': '#EA4335',
      'Manufacturing': '#FBBC05',
      'Health care and social assistance': '#34A853',
      'Public administration': '#FF6D01',
      'Educational services': '#46BDC6'
    };
    
    return colors[industry] || '#000000';
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
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
          formatter={(value) => [`${value ? value.toFixed(1) : 'N/A'}%`, 'Unemployment']} 
          labelFormatter={(label) => label}
        />
        <Legend />
        
        {validSelectedIndustries.map(industry => (
          <Line
            key={industry}
            type="monotone"
            dataKey={industry}
            name={industry.length > 25 ? industry.substring(0, 25) + '...' : industry}
            stroke={getIndustryColor(industry)}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            connectNulls={true}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default IndustryChart;