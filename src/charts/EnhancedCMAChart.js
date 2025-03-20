import React, { useState, useEffect } from 'react';

/**
 * 都市区失业率地理热力图组件
 * 
 * @param {Object} props
 * @param {Array} props.data - CMA失业率数据
 * @returns {React.ReactElement} CMA失业率地理热力图组件
 */
const EnhancedCMAChart = ({ data }) => {
  const [svgContent, setSvgContent] = useState(null);
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // 生成地图
    generateMap();
  }, [data]);
  
  const generateMap = () => {
    // Alberta主要城市的地理坐标 (简化版本，相对坐标)
    const cityCoordinates = {
      'Calgary': { x: 300, y: 400 },
      'Edmonton': { x: 310, y: 280 },
      'Lethbridge': { x: 270, y: 480 },
      'Red Deer': { x: 310, y: 340 },
      'Medicine Hat': { x: 380, y: 450 },
      'Grande Prairie': { x: 180, y: 180 },
      'Fort McMurray': { x: 390, y: 150 }
    };
    
    // 从失业率得到颜色 - 从浅蓝到深蓝
    const getColor = (value) => {
      // 失业率范围假设为 3% 到 9%
      const minRate = 3;
      const maxRate = 9;
      
      // 将失业率标准化到0-1范围
      const normalized = Math.min(Math.max((value - minRate) / (maxRate - minRate), 0), 1);
      
      // 计算RGB值 - 从浅蓝 (#E3F2FD) 到深蓝 (#1565C0)
      const r = Math.round(227 - normalized * (227 - 21));
      const g = Math.round(242 - normalized * (242 - 101));
      const b = Math.round(253 - normalized * (253 - 192));
      
      return `rgb(${r}, ${g}, ${b})`;
    };
    
    // 生成SVG内容
    let svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 600">
        <!-- Alberta省轮廓 (简化版) -->
        <path d="M100,100 L400,100 L450,300 L400,500 L300,550 L150,500 L100,300 Z" 
              fill="#f8f9fa" stroke="#ddd" stroke-width="2" />
    `;
    
    // 添加城市标记和数据
    data.forEach(cityData => {
      const cityName = cityData.GeoName;
      const coordinates = cityCoordinates[cityName];
      
      if (coordinates) {
        const value = cityData.Value || 0;
        const color = getColor(value);
        const radius = 20 + value * 3; // 失业率越高，圆圈越大
        
        // 添加城市圆圈
        svg += `
          <circle 
            cx="${coordinates.x}" 
            cy="${coordinates.y}" 
            r="${radius}" 
            fill="${color}" 
            fill-opacity="0.7" 
            stroke="#fff" 
            stroke-width="1" 
          />
          <text 
            x="${coordinates.x}" 
            y="${coordinates.y}" 
            text-anchor="middle" 
            dy="0.3em" 
            font-size="12" 
            font-weight="bold" 
            fill="#000"
          >${cityName}</text>
          <text 
            x="${coordinates.x}" 
            y="${coordinates.y + 15}" 
            text-anchor="middle" 
            font-size="11" 
            fill="#000"
          >${value.toFixed(1)}%</text>
        `;
      }
    });
    
    // 添加图例
    svg += `
      <g transform="translate(380, 20)">
        <text x="0" y="0" font-size="12" font-weight="bold">失业率</text>
        <rect x="0" y="10" width="20" height="10" fill="${getColor(3)}" stroke="#ddd" />
        <text x="25" y="18" font-size="10">3%</text>
        <rect x="0" y="25" width="20" height="10" fill="${getColor(6)}" stroke="#ddd" />
        <text x="25" y="33" font-size="10">6%</text>
        <rect x="0" y="40" width="20" height="10" fill="${getColor(9)}" stroke="#ddd" />
        <text x="25" y="48" font-size="10">9%</text>
      </g>
    `;
    
    // 关闭SVG标签
    svg += '</svg>';
    
    setSvgContent(svg);
  };

  const dateDateStr = data.length > 0 ? new Date(data[0].Date).toLocaleDateString() : '';

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="font-bold text-lg mb-2">Unemployment Rate by Census Metropolitan Area</h2>
      <div className="text-sm text-gray-500 mb-4">Latest data: {dateDateStr}</div>
      <div className="h-72" dangerouslySetInnerHTML={{ __html: svgContent }} />
    </div>
  );
};

export default EnhancedCMAChart;