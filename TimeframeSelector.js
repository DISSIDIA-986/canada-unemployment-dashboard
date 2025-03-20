import React from 'react';

/**
 * 时间范围选择器组件
 * 
 * @param {Object} props
 * @param {string} props.selectedTimeframe - 当前选中的时间范围
 * @param {Function} props.onChange - 时间范围变化处理函数
 * @returns {React.ReactElement} 时间范围选择器组件
 */
const TimeframeSelector = ({ selectedTimeframe, onChange }) => {
  // 可用的时间范围选项
  const timeframes = [
    { value: '1年', label: '1年' },
    { value: '3年', label: '3年' },
    { value: '5年', label: '5年' },
    { value: '10年', label: '10年' },
    { value: '全部数据', label: '全部数据' }
  ];

  return (
    <div className="flex items-center space-x-2 flex-wrap">
      <div className="font-medium text-sm">时间范围:</div>
      <div className="flex space-x-2 flex-wrap">
        {timeframes.map(tf => (
          <button
            key={tf.value}
            className={`px-3 py-1 rounded-md text-sm ${
              selectedTimeframe === tf.value 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => onChange(tf.value)}
          >
            {tf.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeframeSelector;
