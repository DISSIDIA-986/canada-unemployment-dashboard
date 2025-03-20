import React from 'react';
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
  if (!data || data.length === 0) {
    return (
      <ChartContainer title="Unemployment Rate by Gender">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">No gender data available</div>
        </div>
      </ChartContainer>
    );
  }

  console.log("SexChart received data:", data.slice(0, 5));

  return (
    <ChartContainer title="Unemployment Rate by Gender">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="formattedDate" 
            tickFormatter={(value) => value ? value.split('-')[0] : ''}
            minTickGap={60}
          />
          <YAxis 
            domain={[0, 'auto']}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Unemployment']} 
            labelFormatter={(label) => label}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Male"
            name="Male"
            stroke="#2196F3"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            connectNulls={true}
          />
          <Line
            type="monotone"
            dataKey="Female"
            name="Female"
            stroke="#E91E63"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default SexChart;
