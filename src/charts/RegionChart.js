import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartContainer from '../components/ChartContainer';

/**
 * 经济区域失业率对比图表
 * 
 * @param {Object} props
 * @param {Array} props.data - 区域失业率数据
 * @returns {React.ReactElement} 区域失业率对比组件
 */
const RegionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // 获取前5个失业率最高的区域
  const topRegions = data.slice(0, 5);
  
  // 格式化为图表数据
  const chartData = topRegions.map(region => ({
    region: region.GeoName,
    value: region.Value || 0
  }));

  const dateDateStr = data.length > 0 ? new Date(data[0].Date).toLocaleDateString() : '';

  return (
    <ChartContainer 
      title="Alberta Economic Region Unemployment Rate" 
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
            dataKey="region" 
            tick={{ fontSize: 12 }}
          />
          <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Unemployment']} />
          <Bar 
            dataKey="value" 
            fill="#AB47BC"
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

export default RegionChart;
