import React from 'react';

/**
 * 图表容器组件
 * 为图表提供一致的样式和标题
 * 
 * @param {Object} props
 * @param {string} props.title - 图表标题
 * @param {string} props.subtitle - 图表副标题（可选）
 * @param {React.ReactNode} props.filters - 图表筛选器（可选）
 * @param {React.ReactNode} props.children - 图表内容
 * @returns {React.ReactElement} 图表容器组件
 */
const ChartContainer = ({ title, subtitle, filters, children }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="font-bold text-lg mb-2">{title}</h2>
      {subtitle && <div className="text-sm text-gray-500 mb-4">{subtitle}</div>}
      {filters && <div className="mb-4">{filters}</div>}
      <div className="h-72">
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;
