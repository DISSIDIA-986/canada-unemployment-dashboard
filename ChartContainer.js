import React from 'react';

/**
 * 通用图表容器组件
 * 
 * @param {Object} props
 * @param {string} props.title - 图表标题
 * @param {string} props.subtitle - 图表副标题（可选）
 * @param {React.ReactNode} props.children - 图表内容
 * @param {React.ReactNode} props.filters - 筛选器组件（可选）
 * @param {string} props.className - 额外的CSS类（可选）
 * @returns {React.ReactElement} 图表容器组件
 */
const ChartContainer = ({ title, subtitle, children, filters, className = '' }) => {
  return (
    <div className={`bg-white p-4 rounded-lg shadow mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
        <div>
          <h2 className="font-bold text-lg">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {filters && (
          <div className="mt-2 md:mt-0 flex flex-wrap gap-2">
            {filters}
          </div>
        )}
      </div>
      
      <div className="h-64 md:h-72">
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;
