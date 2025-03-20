import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartContainer from '../components/ChartContainer';
import { getAvailableProvinces } from '../utils/dataProcessing';
import * as d3 from 'd3';

/**
 * 省份失业率对比图表
 * 
 * @param {Object} props
 * @param {Array} props.data - 省份失业率数据
 * @param {Array} props.selectedProvinces - 选中的省份
 * @param {Function} props.onProvinceSelection - 省份选择回调函数
 * @returns {React.ReactElement} 省份失业率对比组件
 */
const ProvinceChart = ({ data, selectedProvinces, onProvinceSelection }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // 获取可用省份
  const availableProvinces = getAvailableProvinces(data);

  // 省份颜色比例尺
  const provinceColorScale = d3.scaleOrdinal()
    .domain(['Alberta', 'Canada', 'British Columbia', 'Ontario', 'Quebec'])
    .range(['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC']);

  // 生成省份筛选器
  const provinceFilters = (
    <div className="flex flex-wrap gap-2 mt-2">
      {availableProvinces.map(province => (
        <div
          key={province}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
            selectedProvinces.includes(province) 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-500'
          }`}
          onClick={() => onProvinceSelection(province)}
        >
          {province}
        </div>
      ))}
    </div>
  );

  return (
    <ChartContainer 
      title="Provincial Unemployment Rate Comparison"
      filters={provinceFilters}
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
            formatter={(value) => [`${value.toFixed(1)}%`, 'Unemployment']}
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
