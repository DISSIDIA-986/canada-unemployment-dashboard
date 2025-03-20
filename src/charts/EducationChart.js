import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartContainer from '../components/ChartContainer';
import { filterByTimeframe, getAvailableEducationLevels } from '../utils/dataProcessing';
import { educationColorScale } from '../utils/colorScales';

/**
 * 教育程度失业率对比图表
 * 
 * @param {Object} props
 * @param {Array} props.data - 教育程度失业率数据
 * @param {string} props.timeframe - 选中的时间范围
 * @returns {React.ReactElement} 教育程度失业率对比组件
 */
const EducationChart = ({ data, timeframe }) => {
  const [selectedLevels, setSelectedLevels] = useState([]);
  
  const filteredData = filterByTimeframe(data, timeframe);
  
  if (!filteredData || filteredData.length === 0) {
    return null;
  }

  // 当数据变化时，更新默认选中的教育程度
  useEffect(() => {
    if (data && data.length > 0) {
      const availableLevels = getAvailableEducationLevels(data);
      setSelectedLevels(availableLevels);
    }
  }, [data]);

  // 处理教育程度选择变化
  const handleLevelSelection = (level) => {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter(l => l !== level));
    } else {
      setSelectedLevels([...selectedLevels, level]);
    }
  };

  // 生成教育程度筛选器
  const levelFilters = (
    <>
      {getAvailableEducationLevels(data).map(level => (
        <div
          key={level}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
            selectedLevels.includes(level) 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-500'
          }`}
          onClick={() => handleLevelSelection(level)}
        >
          {level.length > 25 ? level.substring(0, 25) + '...' : level}
        </div>
      ))}
    </>
  );

  return (
    <ChartContainer 
      title="教育程度失业率对比" 
      filters={levelFilters}
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
          {selectedLevels.map(level => (
            <Line
              key={level}
              type="monotone"
              dataKey={level}
              name={level.length > 25 ? level.substring(0, 25) + '...' : level}
              stroke={educationColorScale(level)}
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

export default EducationChart;
