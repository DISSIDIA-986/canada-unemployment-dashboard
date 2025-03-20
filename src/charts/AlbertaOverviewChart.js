import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartContainer from '../components/ChartContainer';
import { filterByTimeframe } from '../utils/dataProcessing';
import * as d3 from 'd3';

/**
 * Alberta失业率概览图表
 * 
 * @param {Object} props
 * @param {Array} props.data - Alberta失业率数据
 * @param {string} props.timeframe - 选中的时间范围
 * @returns {React.ReactElement} Alberta失业率概览组件
 */
const AlbertaOverviewChart = ({ data, timeframe }) => {
  const filteredData = filterByTimeframe(data, timeframe);
  
  if (!filteredData || filteredData.length === 0) {
    return null;
  }
  
  // 获取当前、最低、最高值
  const currentValue = filteredData[filteredData.length - 1].value;
  const minValue = d3.min(filteredData, d => d.value);
  const maxValue = d3.max(filteredData, d => d.value);
  
  // 计算同比变化
  const currentDate = filteredData[filteredData.length - 1].date;
  const lastYearDate = new Date(currentDate);
  lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
  
  const lastYearValue = filteredData.find(d => 
    d.date.getFullYear() === lastYearDate.getFullYear() && 
    d.date.getMonth() === lastYearDate.getMonth()
  )?.value;
  
  const yoyChange = lastYearValue ? (currentValue - lastYearValue) : null;
  
  const chartData = filteredData.map(d => ({
    date: d.formattedDate,
    value: d.value
  }));
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500 mb-1">Current Rate</div>
          <div className="text-2xl font-bold">{currentValue.toFixed(1)}%</div>
          {yoyChange !== null && (
            <div className={`text-sm ${yoyChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
              {yoyChange < 0 ? 'Down' : 'Up'} {Math.abs(yoyChange).toFixed(1)}% year-over-year
            </div>
          )}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500 mb-1">Period Low</div>
          <div className="text-2xl font-bold">{minValue.toFixed(1)}%</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500 mb-1">Period High</div>
          <div className="text-2xl font-bold">{maxValue.toFixed(1)}%</div>
        </div>
      </div>
      
      <ChartContainer title="Alberta Unemployment Trend">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => value.split('-')[0]}
              minTickGap={60}
            />
            <YAxis 
              domain={[0, 'auto']}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Unemployment']} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#4285F4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </>
  );
};

export default AlbertaOverviewChart;
