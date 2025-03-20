import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartContainer from '../components/ChartContainer';

/**
 * Alberta区域失业率增强图表
 * 
 * @param {Object} props
 * @param {Array} props.data - 区域失业率数据
 * @returns {React.ReactElement} 区域失业率对比组件
 */
const EnhancedRegionChart = ({ data }) => {
  // 使用useMemo优化数据处理，避免不必要的重新计算
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data
      .filter(region => region.Value !== null) // 过滤掉无效值
      .sort((a, b) => (b.Value || 0) - (a.Value || 0)) // 按失业率从高到低排序
      .map(region => ({
        region: region.GeoName,
        value: region.Value || 0
      }));
  }, [data]);

  if (chartData.length === 0) {
    return null;
  }

  const dateDateStr = data.length > 0 ? new Date(data[0].Date).toLocaleDateString() : '';
  
  // 颜色映射 - 根据失业率值创建色阶
  const getBarColor = (value) => {
    const maxRate = Math.max(...chartData.map(item => item.value));
    const minRate = Math.min(...chartData.map(item => item.value));
    const range = maxRate - minRate;
    
    if (range === 0) return '#8884d8';
    
    const normalizedValue = (value - minRate) / range;
    return `hsl(${240 + normalizedValue * 60}, 70%, ${60 - normalizedValue * 20}%)`;
  };

  return (
    <ChartContainer 
      title="Alberta Region Unemployment Comparison" 
      subtitle={`Latest data: ${dateDateStr}`}
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          layout="horizontal"
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="region"
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-45}
            textAnchor="end"
          />
          <YAxis
            type="number"
            domain={[0, 'dataMax + 1']}
            tickFormatter={(value) => `${value}%`}
            label={{ value: 'Unemployment Rate', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Unemployment Rate']} />
          <Bar 
            dataKey="value" 
            name="Unemployment Rate"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default EnhancedRegionChart;
