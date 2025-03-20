import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartContainer from '../components/ChartContainer';

/**
 * 性别失业率对比图表
 * 
 * @param {Object} props
 * @param {Array} props.data - 性别失业率数据
 * @returns {React.ReactElement} 性别失业率对比组件
 */
const SexChart = ({ data }) => {
  // 定义可用的性别类别
  const sexCategories = ['Male', 'Female', 'Both sexes'];
  
  // 选择状态 - 确保总是在顶层声明
  const [selectedCategories, setSelectedCategories] = useState(['Male', 'Female', 'Both sexes']);

  // 处理性别类别选择 - 普通函数
  const handleCategorySelection = (category) => {
    if (selectedCategories.includes(category)) {
      // 确保至少有一个类别被选中
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== category));
      }
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // 早期返回放在所有hooks之后
  if (!data || data.length === 0) {
    console.log("SexChart: No data available");
    return (
      <ChartContainer title="Unemployment Rate by Sex">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No data available</p>
        </div>
      </ChartContainer>
    );
  }

  console.log("SexChart data:", data.slice(0, 2));
  console.log("Selected categories:", selectedCategories);
  
  // 为调试打印每个数据点包含的键
  if (data.length > 0) {
    console.log("Available keys in data:", Object.keys(data[0]));
  }

  // 性别类别颜色映射
  const sexColorMap = {
    'Male': '#1E88E5',
    'Female': '#D81B60',
    'Both sexes': '#8E24AA'
  };

  // 生成性别筛选器
  const sexFilters = (
    <div className="flex flex-wrap gap-2 mt-2">
      {sexCategories.map(category => (
        <div
          key={category}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
            selectedCategories.includes(category) 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-500'
          }`}
          onClick={() => handleCategorySelection(category)}
        >
          {category}
        </div>
      ))}
    </div>
  );

  return (
    <ChartContainer 
      title="Unemployment Rate by Sex"
      filters={sexFilters}
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
            formatter={(value, name) => {
              return [`${value !== undefined ? value.toFixed(1) : 'N/A'}%`, name];
            }}
            labelFormatter={(label) => label}
          />
          <Legend />
          
          {/* 检查每个性别类别是否有对应的数据，并显示线条 */}
          {selectedCategories.map(category => {
            // 检查是否有此类别的数据
            const hasData = data.some(item => 
              item[category] !== undefined && item[category] !== null
            );
            
            return hasData ? (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                name={category}
                stroke={sexColorMap[category]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                connectNulls
              />
            ) : null;
          })}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default SexChart;
