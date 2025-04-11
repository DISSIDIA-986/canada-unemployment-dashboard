import React, { useState } from 'react';

// 图片基础URL
const BASE_URL = "https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures";

// 图表分类及说明
const chartCategories = [
  {
    id: 'forecast',
    name: 'Unemployment Forecasts',
    description: 'Predicted unemployment rates and trends for different regions and demographics',
    charts: [
      { filename: 'unemployment_forecast_overall.png', title: 'Overall Unemployment Forecast', description: 'Predicted unemployment rate trends for all categories combined' },
      { filename: 'unemployment_forecast_canada.png', title: 'Canada Unemployment Forecast', description: 'Future unemployment rate projections for Canada as a whole' },
      { filename: 'unemployment_forecast_alberta.png', title: 'Alberta Unemployment Forecast', description: 'Predicted unemployment trends for Alberta province' },
      { filename: 'unemployment_forecast_british_columbia.png', title: 'British Columbia Forecast', description: 'Unemployment rate predictions for British Columbia' },
      { filename: 'unemployment_forecast_newfoundland_and_labrador.png', title: 'Newfoundland & Labrador Forecast', description: 'Future unemployment trends for Newfoundland and Labrador' },
      { filename: 'unemployment_forecast_prince_edward_island.png', title: 'PEI Unemployment Forecast', description: 'Projected unemployment rates for Prince Edward Island' },
      { filename: 'province_forecast_comparison.png', title: 'Provincial Forecast Comparison', description: 'Comparison of unemployment forecasts across different provinces' }
    ]
  },
  {
    id: 'education',
    name: 'Education Analysis',
    description: 'Impact of education levels on unemployment rates',
    charts: [
      { filename: 'education_comparison.png', title: 'Education Level Comparison', description: 'Unemployment rates across different education levels' },
      { filename: 'unemployment_forecast_high_school_graduate.png', title: 'High School Graduate Forecast', description: 'Unemployment forecast for high school graduates' },
      { filename: 'unemployment_forecast_postsecondary_certificate_or_diploma.png', title: 'Post-Secondary Certificate Forecast', description: 'Future trends for those with post-secondary certificates' },
      { filename: 'unemployment_forecast_bachelor\'s_degree.png', title: 'Bachelor\'s Degree Forecast', description: 'Unemployment projections for bachelor\'s degree holders' },
      { filename: 'unemployment_forecast_above_bachelor\'s_degree.png', title: 'Above Bachelor\'s Forecast', description: 'Trends for individuals with education beyond bachelor\'s degree' },
      { filename: 'unemployment_by_Education.png', title: 'Unemployment by Education', description: 'Current unemployment rates broken down by education level' },
      { filename: 'unemployment_by_Education_impact.png', title: 'Education Impact on Unemployment', description: 'How different education levels affect unemployment risk' },
      { filename: 'education_forecast_comparison.png', title: 'Education Forecast Comparison', description: 'Side-by-side comparison of forecasts across education levels' }
    ]
  },
  {
    id: 'demographic',
    name: 'Demographic Insights',
    description: 'Age, gender and demographic factors affecting unemployment',
    charts: [
      { filename: 'age_comparison.png', title: 'Age Group Comparison', description: 'Unemployment rates across different age groups' },
      { filename: 'gender_gap_canada.png', title: 'Gender Gap Overview', description: 'Comparison of unemployment rates between males and females' },
      { filename: 'gender_gap_canada_gap.png', title: 'Gender Gap Trend', description: 'Historical trend of the gender gap in unemployment rates' },
      { filename: 'unemployment_by_Age_impact.png', title: 'Age Impact on Unemployment', description: 'How age affects unemployment risk' },
      { filename: 'unemployment_by_Sex_impact.png', title: 'Gender Impact on Unemployment', description: 'How gender affects unemployment risk' }
    ]
  },
  {
    id: 'regional',
    name: 'Regional Analysis',
    description: 'Geographic variations in unemployment across Canada',
    charts: [
      { filename: 'province_comparison.png', title: 'Province Comparison', description: 'Unemployment rates across different provinces' },
      { filename: 'canada_unemployment.png', title: 'Canada Overall Trend', description: 'Historical unemployment trend for Canada overall' },
      { filename: 'unemployment_by_GeoName.png', title: 'Geographic Breakdown', description: 'Unemployment rates by geographic region' },
      { filename: 'unemployment_by_GeoName_impact.png', title: 'Geographic Impact', description: 'How location affects unemployment risk' },
      { filename: 'regional_salary_comparison.png', title: 'Regional Salary Comparison', description: 'Comparison of salaries across different regions' }
    ]
  },
  {
    id: 'industry',
    name: 'Industry & Occupation',
    description: 'Industry-specific unemployment and vacancy analysis',
    charts: [
      { filename: 'industry_impact_on_unemployment.png', title: 'Industry Impact', description: 'How different industries affect unemployment rates' },
      { filename: 'industry_vacancies.png', title: 'Industry Vacancy Rates', description: 'Job vacancy rates across different industries' },
      { filename: 'vacancy_trends.png', title: 'Vacancy Trends', description: 'Historical trends in job vacancies' },
      { filename: 'occupation_vacancies.png', title: 'Occupation Vacancies', description: 'Job vacancies by occupation type' },
      { filename: 'regional_vacancies.png', title: 'Regional Vacancies', description: 'Job vacancies by geographic region' },
      { filename: 'occupation_salary_comparison.png', title: 'Occupation Salary Comparison', description: 'Salary comparison across different occupations' },
      { filename: 'salary_distribution_analysis.png', title: 'Salary Distribution', description: 'Overall distribution of salaries in the job market' }
    ]
  },
  {
    id: 'occupational',
    name: 'Occupational Classification',
    description: 'Analysis of occupational codes and structures',
    charts: [
      { filename: 'noc_category_structure.png', title: 'NOC Category Structure', description: 'Structure of the National Occupational Classification system' },
      { filename: 'noc_code_distribution.png', title: 'NOC Code Distribution', description: 'Distribution of jobs across NOC codes' },
      { filename: 'occupation_skills.png', title: 'Occupation Skills Analysis', description: 'Key skills required across different occupations' },
      { filename: 'occupation_trends.png', title: 'Occupation Trends', description: 'Trends in different occupational categories' }
    ]
  },
  {
    id: 'correlations',
    name: 'Factor Correlations',
    description: 'How different factors interact and affect unemployment',
    charts: [
      { filename: 'category_correlation_matrix.png', title: 'Category Correlation Matrix', description: 'Correlations between different unemployment factors' },
      { filename: 'heatmap_educational_attainment_age_group.png', title: 'Education & Age Interaction', description: 'How education and age interact to affect unemployment' },
      { filename: 'heatmap_educational_attainment_gender.png', title: 'Education & Gender Interaction', description: 'How education and gender interact to affect unemployment' },
      { filename: 'interaction_heatmap_Education_GeoName.png', title: 'Education & Region Interaction', description: 'How education and location interact to affect unemployment' },
      { filename: 'heatmap_gender_age_group.png', title: 'Gender & Age Interaction', description: 'How gender and age interact to affect unemployment' },
      { filename: 'interaction_heatmap_Sex_GeoName.png', title: 'Gender & Region Interaction', description: 'How gender and location interact to affect unemployment' },
      { filename: 'interaction_heatmap_Age_GeoName.png', title: 'Age & Region Interaction', description: 'How age and location interact to affect unemployment' }
    ]
  },
  {
    id: 'models',
    name: 'Predictive Models',
    description: 'Machine learning model results and feature importance',
    charts: [
      { filename: 'gradient_boosting_feature_importance.png', title: 'Gradient Boosting Features', description: 'Important features identified by gradient boosting models' },
      { filename: 'neural_network_feature_importance.png', title: 'Neural Network Features', description: 'Features identified as important by neural networks' },
      { filename: 'unemployment_feature_mdi_importance.png', title: 'Feature MDI Importance', description: 'Feature importance based on mean decrease in impurity' },
      { filename: 'unemployment_feature_permutation_ranking.png', title: 'Feature Permutation Ranking', description: 'Feature ranking based on permutation importance' },
      { filename: 'model_performance_metrics_comparison.png', title: 'Model Performance Comparison', description: 'Comparison of different predictive models' },
      { filename: 'model_r2_score_comparison.png', title: 'Model R² Score Comparison', description: 'R² scores of different predictive models' },
      { filename: 'risk_score_distribution.png', title: 'Risk Score Distribution', description: 'Distribution of unemployment risk scores' }
    ]
  }
];

// 部分图表可能不存在或名称有误，这里是一些备选文件名映射
const filenameFallbacks = {
  'unemployment_feature_mdi_importance.png': 'unemployment_feature_mdi_ranking.png',
  'unemployment_feature_permutation_ranking.png': 'unemployment_feature_permutation_importance.png'
};

const AnalysisResultsChart = () => {
  const [activeCategory, setActiveCategory] = useState(chartCategories[0].id);
  const [expandedChart, setExpandedChart] = useState(null);

  // 找到当前激活的分类
  const currentCategory = chartCategories.find(cat => cat.id === activeCategory);

  // 处理图表点击，显示放大视图
  const handleChartClick = (chart) => {
    setExpandedChart(chart);
  };

  // 关闭放大视图
  const closeExpandedView = () => {
    setExpandedChart(null);
  };

  // 获取图片URL，带有备选文件名检查
  const getImageUrl = (filename) => {
    return `${BASE_URL}/${filenameFallbacks[filename] || filename}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-xl">Advanced Analysis Results</h2>
        <div className="text-sm text-gray-500">
          75 charts from comprehensive unemployment analysis
        </div>
      </div>

      {/* 分类标签页 */}
      <div className="mb-6 border-b overflow-x-auto">
        <div className="flex whitespace-nowrap">
          {chartCategories.map(category => (
            <button
              key={category.id}
              className={`pb-2 px-4 ${activeCategory === category.id ? 'border-b-2 border-blue-500 font-medium' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 分类描述 */}
      {currentCategory && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">{currentCategory.description}</p>
        </div>
      )}

      {/* 图表网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCategory?.charts.map(chart => (
          <div 
            key={chart.filename} 
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleChartClick(chart)}
          >
            <img 
              src={getImageUrl(chart.filename)} 
              alt={chart.title}
              className="w-full h-48 object-contain bg-gray-50 p-2"
              onError={(e) => {
                console.error(`Failed to load image: ${chart.filename}`);
                e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
              }}
            />
            <div className="p-3">
              <h3 className="font-medium text-lg">{chart.title}</h3>
              <p className="text-sm text-gray-600">{chart.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 放大视图模态框 */}
      {expandedChart && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeExpandedView}>
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b">
              <h3 className="font-bold text-xl">{expandedChart.title}</h3>
            </div>
            <div className="p-2 bg-gray-50">
              <img 
                src={getImageUrl(expandedChart.filename)} 
                alt={expandedChart.title}
                className="max-w-full"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Found";
                }}
              />
            </div>
            <div className="p-4">
              <p className="text-gray-700">{expandedChart.description}</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={closeExpandedView}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResultsChart;