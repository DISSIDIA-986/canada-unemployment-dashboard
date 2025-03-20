import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartContainer from '../components/ChartContainer';
import { getAvailableAgeGroups } from '../utils/dataProcessing';

/**
 * 年龄组失业率对比图表
 * 
 * @param {Object} props
 * @param {Array} props.data - 年龄组失业率数据
 * @returns {React.ReactElement} 年龄组失业率对比组件
 */
const AgeChart = ({ data }) => {
  // 获取可用年龄组 - 移动到条件判断之前
  const ageGroups = useMemo(() => {
    return data && data.length > 0 ? getAvailableAgeGroups(data) : [];
  }, [data]);
  
  // 选中的年龄组状态 - 移动到条件判断之前
  const [selectedAgeGroups, setSelectedAgeGroups] = useState(() => {
    // 确保数据加载后再设置默认选择
    return data && data.length > 0 ? [...ageGroups] : [];
  });

  // 增加useEffect监听ageGroups变化
  useEffect(() => {
    if (ageGroups.length > 0) {
      setSelectedAgeGroups([...ageGroups]);
    }
  }, [ageGroups]);

  // 处理年龄组选择 - 保持为普通函数
  const handleAgeGroupSelection = (ageGroup) => {
    if (selectedAgeGroups.includes(ageGroup)) {
      // 确保至少有一个年龄组被选中
      if (selectedAgeGroups.length > 1) {
        setSelectedAgeGroups(selectedAgeGroups.filter(ag => ag !== ageGroup));
      }
    } else {
      setSelectedAgeGroups([...selectedAgeGroups, ageGroup]);
    }
  };

  // 早期返回检查放在所有hooks之后
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  // 年龄组颜色映射
  const ageColorMap = {
    '15 to 24 years': '#F44336',
    '25 to 54 years': '#2196F3',
    '55 years and over': '#4CAF50',
    '15 years and over': '#9C27B0'
  };

  // 生成年龄组筛选器
  const ageFilters = (
    <div className="flex flex-wrap gap-2 mt-2">
      {ageGroups.map(ageGroup => (
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
    </div>
  );

  return (
    <ChartContainer 
      title="Unemployment Rate by Age Group"
      filters={ageFilters}
    >
      <ResponsiveContainer width="100%" height={400}>
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
            formatter={(value) => [`${value}%`, 'Unemployment Rate']}
            labelFormatter={(label) => label}
          />
          <Legend />
          
          {/* 渲染每个年龄组的线条 */}
          {selectedAgeGroups.map(ageGroup => (
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
    </ChartContainer>
  );
};

export default AgeChart;
