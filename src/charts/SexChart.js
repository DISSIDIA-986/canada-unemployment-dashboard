import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartContainer from '../components/ChartContainer';
import { filterByTimeframe } from '../utils/dataProcessing';
import { sexColorScale } from '../utils/colorScales';

/**
 * 性别失业率对比图表
 * 
 * @param {Object} props
 * @param {Array} props.data - 性别失业率数据
 * @param {string} props.timeframe - 选中的时间范围
 * @returns {React.ReactElement} 性别失业率对比组件
 */
const SexChart = ({ data, timeframe }) => {
  const filteredData = filterByTimeframe(data, timeframe);
  
  if (!filteredData || filteredData.length === 0) {
    return null;
  }

  return (
    <ChartContainer title="性别失业率对比">
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
          <Line
            type="monotone"
            dataKey="Male"
            name="男性"
            stroke={sexColorScale('Male')}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Female"
            name="女性"
            stroke={sexColorScale('Female')}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          {filteredData[0] && filteredData[0]['Both sexes'] !== undefined && (
            <Line
              type="monotone"
              dataKey="Both sexes"
              name="总体"
              stroke={sexColorScale('Both sexes')}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default SexChart;
