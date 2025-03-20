import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartContainer from '../components/ChartContainer';
import { filterByTimeframe, getAvailableOccupations } from '../utils/dataProcessing';
import { occupationColorScale } from '../utils/colorScales';

/**
 * 职业失业率对比图表
 * 
 * @param {Object} props
 * @param {Array} props.data - 职业失业率数据
 * @param {string} props.timeframe - 选中的时间范围
 * @returns {React.ReactElement} 职业失业率对比组件
 */
const OccupationChart = ({ data, timeframe }) => {
  const [selectedOccupations, setSelectedOccupations] = useState([]);
  
  const filteredData = filterByTimeframe(data, timeframe);
  
  if (!filteredData || filteredData.length === 0) {
    return null;
  }

  // 当数据变化时，更新默认选中的职业
  useEffect(() => {
    if (data && data.length > 0) {
      const availableOccupations = getAvailableOccupations(data);
      
      // 只选择前3个职业，避免图表过于拥挤
      setSelectedOccupations(availableOccupations.slice(0, 3));
    }
  }, [data]);

  // 处理职业选择变化
  const handleOccupationSelection = (occupation) => {
    if (selectedOccupations.includes(occupation)) {
      setSelectedOccupations(selectedOccupations.filter(o => o !== occupation));
    } else {
      setSelectedOccupations([...selectedOccupations, occupation]);
    }
  };

  // 生成职业筛选器
  const occupationFilters = (
    <div className="flex flex-wrap gap-2 mt-2">
      {getAvailableOccupations(data).map(occupation => (
        <div
          key={occupation}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
            selectedOccupations.includes(occupation) 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-500'
          }`}
          onClick={() => handleOccupationSelection(occupation)}
        >
          {occupation.length > 25 ? occupation.substring(0, 25) + '...' : occupation}
        </div>
      ))}
    </div>
  );

  return (
    <ChartContainer 
      title="Unemployment Rate by Occupation"
      filters={occupationFilters}
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
            formatter={(value) => [`${value.toFixed(1)}%`, 'Unemployment']} 
            labelFormatter={(label) => label}
          />
          <Legend />
          {selectedOccupations.map(occupation => (
            <Line
              key={occupation}
              type="monotone"
              dataKey={occupation}
              name={occupation.length > 25 ? occupation.substring(0, 25) + '...' : occupation}
              stroke={occupationColorScale(occupation)}
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

export default OccupationChart;
