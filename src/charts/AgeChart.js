import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartContainer from '../components/ChartContainer';
import { filterByTimeframe, getAvailableAgeGroups } from '../utils/dataProcessing';
import { ageColorScale } from '../utils/colorScales';

/**
 * 年龄组失业率对比图表
 * 
 * @param {Object} props
 * @param {Array} props.data - 年龄组失业率数据
 * @param {string} props.timeframe - 选中的时间范围
 * @returns {React.ReactElement} 年龄组失业率对比组件
 */
const AgeChart = ({ data, timeframe }) => {
  const [selectedAgeGroups, setSelectedAgeGroups] = useState([]);
  
  const filteredData = filterByTimeframe(data, timeframe);
  
  if (!filteredData || filteredData.length === 0) {
    return null;
  }

  // 获取可用的年龄组
  useEffect(() => {
    if (data && data.length > 0) {
      const availableAgeGroups = getAvailableAgeGroups(data);
      setSelectedAgeGroups(availableAgeGroups);
    }
  }, [data]);

  // 处理年龄组选择变化
  const handleAgeGroupSelection = (ageGroup) => {
    if (selectedAgeGroups.includes(ageGroup)) {
      setSelectedAgeGroups(selectedAgeGroups.filter(g => g !== ageGroup));
    } else {
      setSelectedAgeGroups([...selectedAgeGroups, ageGroup]);
    }
  };

  // 生成年龄组筛选器
  const ageGroupFilters = (
    <>
      {getAvailableAgeGroups(data).map(ageGroup => (
        <div
          key={ageGroup}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
            selectedAgeGroups.includes(ageGroup) 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-500'
          }`}
          onClick={() => handleAgeGroupSelection(ageGroup)}
        >
          {ageGroup}
        </div>
      ))}
    </>
  );

  return (
    <ChartContainer 
      title="年龄组失业率对比" 
      filters={ageGroupFilters}
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
          {selectedAgeGroups.map(ageGroup => (
            <Line
              key={ageGroup}
              type="monotone"
              dataKey={ageGroup}
              name={ageGroup}
              stroke={ageColorScale(ageGroup)}
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

export default AgeChart;
