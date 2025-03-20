import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartContainer from '../components/ChartContainer';

/**
 * 人口普查都市区(CMA)失业率对比图表
 * 
 * @param {Object} props
 * @param {Array} props.data - CMA失业率数据
 * @returns {React.ReactElement} CMA失业率对比组件
 */
const CMAChart = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // 获取前5个失业率最高的都市区
  const topCities = data.slice(0, 7);
  
  // 格式化为图表数据
  const chartData = topCities.map(city => ({
    city: city.GeoName,
    value: city.Value || 0
  }));

  const dateDateStr = data.length > 0 ? new Date(data[0].Date).toLocaleDateString() : '';

  return (
    <ChartContainer 
      title="Unemployment Rate by Census Metropolitan Area" 
      subtitle={`Latest data: ${dateDateStr}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={[0, 'dataMax + 1']}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis 
            type="category" 
            dataKey="city" 
            tick={{ fontSize: 12 }}
          />
          <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, '失业率']} />
          <Bar 
            dataKey="value" 
            fill="#4285F4"
            label={{ 
              position: 'right', 
              formatter: (value) => `${value.toFixed(1)}%`,
              fill: '#000000'
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default CMAChart;
