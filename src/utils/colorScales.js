import * as d3 from 'd3';

// 省份颜色比例尺
export const provinceColorScale = d3.scaleOrdinal()
  .domain(['Alberta', 'Canada', 'British Columbia', 'Ontario', 'Quebec', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador', 'Prince Edward Island'])
  .range(['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC', '#00ACC1', '#FF7043', '#9E9E9E', '#5C6BC0', '#26A69A', '#EC407A']);

// 性别颜色比例尺
export const sexColorScale = d3.scaleOrdinal()
  .domain(['Male', 'Female', 'Both sexes'])
  .range(['#1E88E5', '#D81B60', '#8E24AA']);

// 年龄组颜色比例尺
export const ageColorScale = d3.scaleOrdinal()
  .domain(['15 to 24 years', '25 to 54 years', '55 to 64 years', '65 years and over', '15 years and over'])
  .range(['#F44336', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0']);

// 行业颜色比例尺
export const industryColorScale = d3.scaleOrdinal()
  .domain(['Total, all industries', 'Goods-producing sector', 'Services-producing sector', 'Agriculture', 'Forestry, fishing, mining, quarrying, oil and gas', 'Construction', 'Manufacturing', 'Wholesale and retail trade', 'Transportation and warehousing', 'Finance, insurance, real estate, rental and leasing', 'Professional, scientific and technical services', 'Educational services', 'Health care and social assistance', 'Information, culture and recreation', 'Accommodation and food services'])
  .range(['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC', '#00ACC1', '#FF7043', '#9E9E9E', '#5C6BC0', '#26A69A', '#EC407A', '#66BB6A', '#FFA726', '#42A5F5', '#7E57C2']);

// 教育程度颜色比例尺
export const educationColorScale = d3.scaleOrdinal()
  .domain(['Less than high school', 'High school graduate', 'Some post-secondary', 'Post-secondary certificate or diploma', 'University degree'])
  .range(['#795548', '#FF9800', '#FFEB3B', '#03A9F4', '#673AB7']);

// 职业颜色比例尺
export const occupationColorScale = d3.scaleOrdinal()
  .domain(['Management occupations', 'Business, finance and administration occupations', 'Natural and applied sciences and related occupations', 'Health occupations', 'Occupations in education, law and social, community and government services', 'Occupations in art, culture, recreation and sport', 'Sales and service occupations', 'Trades, transport and equipment operators and related occupations', 'Natural resources, agriculture and related production occupations', 'Occupations in manufacturing and utilities'])
  .range(['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC', '#00ACC1', '#FF7043', '#9E9E9E', '#5C6BC0', '#26A69A']);

// 通用颜色获取函数
export const getColor = (category, value) => {
  let scale;
  
  switch(category) {
    case 'province':
      scale = provinceColorScale;
      break;
    case 'sex':
      scale = sexColorScale;
      break;
    case 'age':
      scale = ageColorScale;
      break;
    case 'industry':
      scale = industryColorScale;
      break;
    case 'education':
      scale = educationColorScale;
      break;
    case 'occupation':
      scale = occupationColorScale;
      break;
    default:
      // 默认蓝色色阶
      return d3.interpolateBlues(value / 100);
  }
  
  return scale(value);
};
