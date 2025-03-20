import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartContainer from '../components/ChartContainer';
import { getAvailableEducationLevels } from '../utils/dataProcessing';

/**
 * 教育程度失业率对比图表
 * 
 * @param {Object} props
 * @param {Array} props.data - 教育程度失业率数据
 * @returns {React.ReactElement} 教育程度失业率对比组件
 */
const EducationChart = ({ data }) => {
  // 使用useMemo缓存教育程度列表，避免不必要的重新计算
  const educationLevels = useMemo(() => {
    return data && data.length > 0 ? getAvailableEducationLevels(data) : [];
  }, [data]);
  
  // 选中的教育程度状态
  const [selectedLevels, setSelectedLevels] = useState([]);
  
  // 初始化选中的教育程度
  useEffect(() => {
    if (educationLevels.length > 0) {
      // 默认选中的教育程度
      const defaultSelected = ['High school graduate', 'University degree', 'Total, all education levels'];
      const initialSelection = defaultSelected.filter(level => educationLevels.includes(level));
      
      // 如果默认选项都不可用，则选择前几个
      if (initialSelection.length === 0) {
        initialSelection.push(...educationLevels.slice(0, Math.min(3, educationLevels.length)));
      }
      
      setSelectedLevels(initialSelection);
    }
  }, [educationLevels]); // 只在educationLevels变化时执行

  // 早期返回需在所有hooks之后
  if (!data || data.length === 0) {
    return null;
  }

  // 教育程度颜色映射
  const educationColorMap = {
    '0 to 8  years': '#8D6E63',
    'Some high school': '#795548',
    'High school graduate': '#FF9800',
    'Some postsecondary': '#FFEB3B',
    'Postsecondary certificate or diploma': '#03A9F4',
    'Bachelor\'s degree': '#7C4DFF',
    'Above bachelor\'s degree': '#673AB7',
    'University degree': '#673AB7',
    'Total, all education levels': '#4285F4'
  };

  // 处理教育程度选择
  const handleLevelSelection = (level) => {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter(l => l !== level));
    } else {
      setSelectedLevels([...selectedLevels, level]);
    }
  };

  // 生成教育程度筛选器
  const educationFilters = (
    <div className="flex flex-wrap gap-2 mt-2">
      {educationLevels.map(level => (
        <div
          key={level}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
            selectedLevels.includes(level) 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-500'
          }`}
          onClick={() => handleLevelSelection(level)}
        >
          {level}
        </div>
      ))}
    </div>
  );

  return (
    <ChartContainer 
      title="Unemployment Rate by Education Level"
      filters={educationFilters}
    >
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
            formatter={(value) => [`${value.toFixed(1)}%`, 'Unemployment']}
            labelFormatter={(label) => label}
          />
          <Legend />
          
          {/* 为选中的教育程度渲染线条 */}
          {selectedLevels.map(level => (
            <Line
              key={level}
              type="monotone"
              dataKey={level}
              name={level}
              stroke={educationColorMap[level] || '#000000'}
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
