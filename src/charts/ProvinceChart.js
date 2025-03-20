import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartContainer from '../components/ChartContainer';
import { filterByTimeframe, getAvailableProvinces } from '../utils/dataProcessing';
import { provinceColorScale } from '../utils/colorScales';

/**
 * 省份失业率对比图表
 * 
 * @param {Object} props
 * @param {Array} props.data - 省份失业率数据
 * @param {string} props.timeframe - 选中的时间范围
 * @returns {React.ReactElement} 省份失业率对比组件
 */
const ProvinceChart = ({ data, timeframe }) => {
  const [selectedProvinces, setSelectedProvinces] = useState(['Alberta', 'Canada', 'British Columbia', 'Ontario']);
  
  const filteredData = filterByTimeframe(data, timeframe);
  
  if (!filteredData || filteredData.length === 0) {
    return null;
  }
  
  // 当数据变化时，更新默认选中的省份
  useEffect(() => {
    if (data && data.length > 0) {
      const availableProvinces = getAvailableProvinces(data);
      
      // 设置默认选中的省份
      const defaultProvinces = [];
      
      // 尝试找到常见省份
      const provinceOptions = [
        "Alberta", 
        "Canada",
        "British Columbia",
        "Ontario"
      ];
      
      // 添加存在于数据中的省份
      provinceOptions.forEach(option => {
        if (availableProvinces.includes(option)) {
          defaultProvinces.push(option);
        }
      });
      
      // 如果找不到首选省份，使用前几个可用的
      if (defaultProvinces.length === 0 && availableProvinces.length > 0) {
        defaultProvinces.push(availableProvinces[0]);
        if (availableProvinces.length > 1) {
          defaultProvinces.push(availableProvinces[1]);
        }
      }
      
      // 如果找到有效选择，更新状态
      if (defaultProvinces.length > 0) {
        setSelectedProvinces(defaultProvinces);
      }
    }
  }, [data]);

  // 处理省份选择变化
  const handleProvinceSelection = (province) => {
    if (selectedProvinces.includes(province)) {
      setSelectedProvinces(selectedProvinces.filter(p => p !== province));
    } else {
      setSelectedProvinces([...selectedProvinces, province]);
    }
  };

  // 生成省份筛选器
  const provinceFilters = (
    <>
      {getAvailableProvinces(data).map(province => (
        <div
          key={province}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
            selectedProvinces.includes(province) 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-500'
          }`}
          onClick={() => handleProvinceSelection(province)}
        >
          {province}
        </div>
      ))}
    </>
  );

  return (
    <ChartContainer 
      title="省份失业率对比" 
      filters={provinceFilters}
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
          {selectedProvinces.map(province => (
            <Line
              key={province}
              type="monotone"
              dataKey={province}
              name={province}
              stroke={provinceColorScale(province)}
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

export default ProvinceChart;
