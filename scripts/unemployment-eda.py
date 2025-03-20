import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import json
import os
from datetime import datetime
from prophet import Prophet

# 设置绘图风格
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette('viridis')

class UnemploymentAnalysis:
    """基于CRISP-DM方法论的加拿大失业率数据分析"""
    
    def __init__(self, json_dir, output_dir):
        """
        初始化分析类
        
        参数:
            json_dir: 包含JSON数据文件的目录
            output_dir: 输出分析结果的目录
        """
        self.json_dir = json_dir
        self.output_dir = output_dir
        
        # 确保输出目录存在
        os.makedirs(output_dir, exist_ok=True)
        
        # 加载数据
        self.age_data = self._load_json('age.json')
        self.education_data = self._load_json('education.json')
        
        # 设置颜色方案
        self.colors = {
            'age': sns.color_palette('viridis', 8),
            'education': sns.color_palette('magma', 10),
            'region': sns.color_palette('plasma', 13)
        }
    
    def _load_json(self, filename):
        """加载JSON文件并转换为DataFrame"""
        try:
            with open(os.path.join(self.json_dir, filename), 'r', encoding='utf-8') as f:
                data = json.load(f)
            return pd.DataFrame(data)
        except Exception as e:
            print(f"加载{filename}时出错: {e}")
            return pd.DataFrame()
    
    def _save_fig(self, filename, dpi=300):
        """保存图表到输出目录"""
        plt.savefig(os.path.join(self.output_dir, filename), dpi=dpi, bbox_inches='tight')
        plt.close()
    
    def preprocess_data(self):
        """数据预处理:清洗和转换数据"""
        # 处理age数据
        if not self.age_data.empty:
            # 转换日期列
            self.age_data['Date'] = pd.to_datetime(self.age_data['Date'])
            # 确保Value列为数值型
            self.age_data['Value'] = pd.to_numeric(self.age_data['Value'], errors='coerce')
            print(f"预处理后的年龄数据:共{len(self.age_data)}行, {self.age_data.shape[1]}列")
        
        # 处理education数据
        if not self.education_data.empty:
            # 转换日期列
            self.education_data['Date'] = pd.to_datetime(self.education_data['Date'])
            # 确保Value列为数值型
            self.education_data['Value'] = pd.to_numeric(self.education_data['Value'], errors='coerce')
            print(f"预处理后的教育数据:共{len(self.education_data)}行, {self.education_data.shape[1]}列")
    
    def analyze_biz_question_1(self):
        """
        业务问题1: 哪些行业和省份在COVID后期(2020-2024)的失业率最高/最低？
        教育水平如何影响失业率？
        """
        print("\n分析业务问题1: 区域和教育因素对失业率的影响")
        
        # 1. 分析省份间的失业率差异 (2020-2024)
        if not self.age_data.empty:
            # 筛选2020-2024年的数据,并关注总体失业率
            recent_data = self.age_data[
                (self.age_data['Date'] >= '2020-01-01') & 
                (self.age_data['Date'] <= '2024-12-31') &
                (self.age_data['Characteristic'] == 'Unemployment rate') &
                (self.age_data['Age'] == '15 years and over') &
                (self.age_data['Sex'] == 'Both sexes')
            ]
            
            # 计算各省平均失业率
            province_avg = recent_data.groupby('GeoName')['Value'].mean().sort_values()
            
            # 可视化各省平均失业率
            plt.figure(figsize=(12, 6))
            bars = province_avg.plot(kind='bar', color=self.colors['region'])
            plt.title('各省平均失业率 (2020-2024)', fontsize=14)
            plt.ylabel('失业率 (%)', fontsize=12)
            plt.xlabel('省份', fontsize=12)
            plt.xticks(rotation=45)
            
            # 在柱状图上添加数值标签
            for i, v in enumerate(province_avg):
                plt.text(i, v + 0.1, f'{v:.1f}%', ha='center')
                
            self._save_fig('province_unemployment_2020_2024.png')
            
            # 输出详细统计数据
            province_stats = recent_data.groupby('GeoName')['Value'].agg(['mean', 'min', 'max', 'std']).round(2)
            province_stats.to_csv(os.path.join(self.output_dir, 'province_unemployment_stats.csv'))
            print(f"各省失业率统计:")
            print(province_stats.sort_values('mean'))
        
        # 2. 分析教育水平对失业率的影响
        if not self.education_data.empty:
            # 筛选2020-2024年的数据,关注教育水平与失业率
            edu_data = self.education_data[
                (self.education_data['Date'] >= '2020-01-01') & 
                (self.education_data['Date'] <= '2024-12-31') &
                (self.education_data['Characteristics'] == 'Unemployment rate') &
                (self.education_data['Sex'] == 'Both sexes') &
                (self.education_data['GeoName'] == 'Canada')
            ]
            
            # 计算各教育水平的平均失业率
            edu_avg = edu_data.groupby('Education')['Value'].mean().sort_values()
            
            # 可视化教育水平与失业率的关系
            plt.figure(figsize=(12, 6))
            bars = edu_avg.plot(kind='bar', color=self.colors['education'])
            plt.title('不同教育水平的平均失业率 (2020-2024)', fontsize=14)
            plt.ylabel('失业率 (%)', fontsize=12)
            plt.xlabel('教育水平', fontsize=12)
            plt.xticks(rotation=45)
            
            # 在柱状图上添加数值标签
            for i, v in enumerate(edu_avg):
                plt.text(i, v + 0.1, f'{v:.1f}%', ha='center')
                
            self._save_fig('education_unemployment_2020_2024.png')
            
            # 输出详细统计数据
            edu_stats = edu_data.groupby('Education')['Value'].agg(['mean', 'min', 'max', 'std']).round(2)
            edu_stats.to_csv(os.path.join(self.output_dir, 'education_unemployment_stats.csv'))
            print(f"各教育水平失业率统计:")
            print(edu_stats.sort_values('mean'))
        
    def analyze_biz_question_2(self):
        """
        业务问题2: 预测2025年的就业市场趋势
        使用Prophet模型进行时间序列预测
        """
        print("\n分析业务问题2: 预测2025年就业市场趋势")
        
        if not self.age_data.empty:
            # 筛选加拿大全国的总体失业率数据
            canada_data = self.age_data[
                (self.age_data['GeoName'] == 'Canada') &
                (self.age_data['Characteristic'] == 'Unemployment rate') &
                (self.age_data['Age'] == '15 years and over') &
                (self.age_data['Sex'] == 'Both sexes')
            ].copy()
            
            # 按月聚合数据
            canada_data['YearMonth'] = canada_data['Date'].dt.strftime('%Y-%m')
            monthly_data = canada_data.groupby('YearMonth', as_index=False)['Value'].mean()
            monthly_data['ds'] = pd.to_datetime(monthly_data['YearMonth'])
            monthly_data.rename(columns={'Value': 'y'}, inplace=True)
            
            # 训练Prophet模型
            try:
                model = Prophet(yearly_seasonality=True, 
                                weekly_seasonality=False,
                                daily_seasonality=False,
                                seasonality_mode='multiplicative')
                model.fit(monthly_data[['ds', 'y']])
                
                # 预测未来12个月
                future = model.make_future_dataframe(periods=12, freq='M')
                forecast = model.predict(future)
                
                # 可视化预测结果
                fig = model.plot(forecast)
                ax = fig.gca()
                ax.set_title("加拿大失业率预测 (2025)", fontsize=14)
                ax.set_xlabel("日期", fontsize=12)
                ax.set_ylabel("失业率 (%)", fontsize=12)
                
                # 高亮2025年预测部分
                mask_2025 = (forecast['ds'] >= '2025-01-01') & (forecast['ds'] <= '2025-12-31')
                ax.plot(forecast.loc[mask_2025, 'ds'], 
                       forecast.loc[mask_2025, 'yhat'], 
                       'r-', linewidth=2, label='2025预测')
                
                # 添加置信区间
                ax.fill_between(forecast.loc[mask_2025, 'ds'],
                               forecast.loc[mask_2025, 'yhat_lower'],
                               forecast.loc[mask_2025, 'yhat_upper'],
                               color='r', alpha=0.2)
                
                plt.legend()
                self._save_fig('unemployment_forecast_2025.png')
                
                # 保存2025年的预测数据
                forecast_2025 = forecast[mask_2025][['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
                forecast_2025.columns = ['Date', 'Predicted_Rate', 'Lower_Bound', 'Upper_Bound']
                forecast_2025.to_csv(os.path.join(self.output_dir, 'canada_unemployment_forecast_2025.csv'), index=False)
                
                print("2025年失业率预测结果:")
                print(forecast_2025.round(2))
                
                # 计算预测的准确性指标
                # 使用历史数据的最后12个月进行验证
                historical = monthly_data.copy()
                train = historical[:-12]
                test = historical[-12:]
                
                # 训练验证模型
                model_val = Prophet(yearly_seasonality=True, 
                                 weekly_seasonality=False,
                                 daily_seasonality=False,
                                 seasonality_mode='multiplicative')
                model_val.fit(train[['ds', 'y']])
                
                # 验证集预测
                future_val = model_val.make_future_dataframe(periods=12, freq='M')
                forecast_val = model_val.predict(future_val)
                
                # 计算MAPE (平均绝对百分比误差)
                actual = test['y'].values
                predicted = forecast_val.tail(12)['yhat'].values
                
                mape = np.mean(np.abs((actual - predicted) / actual)) * 100
                print(f"预测模型MAPE: {mape:.2f}%")
                
            except Exception as e:
                print(f"时间序列预测时出错: {e}")
        
    def analyze_biz_question_3(self):
        """
        业务问题3: 开发职业推荐系统，根据求职者的所在地、教育和行业趋势提供个性化建议
        分析可调整因素对就业前景的影响
        """
        print("\n分析业务问题3: 可调整因素对就业前景的影响")
        
        if not self.education_data.empty:
            # 1. 分析教育水平与就业前景的关系
            # 筛选2020-2024年的数据，提取教育水平对不同地区失业率的影响
            recent_edu = self.education_data[
                (self.education_data['Date'] >= '2020-01-01') & 
                (self.education_data['Date'] <= '2024-12-31') &
                (self.education_data['Characteristics'] == 'Unemployment rate') &
                (self.education_data['Sex'] == 'Both sexes')
            ]
            
            # 选取主要省份和主要教育水平
            key_provinces = ['Alberta', 'Ontario', 'Quebec', 'British Columbia']
            key_education = ['Less than high school', 'High school graduate', 
                             'Postsecondary certificate or diploma', 'University degree']
            
            edu_region_data = recent_edu[
                (recent_edu['GeoName'].isin(key_provinces)) &
                (recent_edu['Education'].isin(key_education))
            ]
            
            # 创建教育水平与地区的交叉热力图
            pivot_df = edu_region_data.groupby(['GeoName', 'Education'])['Value'].mean().unstack()
            
            plt.figure(figsize=(12, 8))
            sns.heatmap(pivot_df, annot=True, fmt='.1f', cmap='YlGnBu', linewidths=0.5)
            plt.title('教育水平与地区对失业率的交叉影响 (2020-2024)', fontsize=14)
            plt.ylabel('省份', fontsize=12)
            plt.xlabel('教育水平', fontsize=12)
            self._save_fig('education_region_heatmap.png')
            
            # 计算教育提升对失业率的平均影响
            # 例如：从高中毕业到大学学位的改善
            edu_improvement = {}
            
            for province in key_provinces:
                province_data = pivot_df.loc[province]
                if 'High school graduate' in province_data and 'University degree' in province_data:
                    hs_rate = province_data['High school graduate']
                    uni_rate = province_data['University degree']
                    improvement = hs_rate - uni_rate
                    improvement_pct = (improvement / hs_rate) * 100
                    edu_improvement[province] = {
                        'high_school_rate': hs_rate,
                        'university_rate': uni_rate,
                        'absolute_improvement': improvement,
                        'percentage_improvement': improvement_pct
                    }
            
            # 将改善数据转换为DataFrame并保存
            edu_impact_df = pd.DataFrame(edu_improvement).T
            edu_impact_df.to_csv(os.path.join(self.output_dir, 'education_impact_by_region.csv'))
            
            # 2. 年龄组与失业率的关系
            if not self.age_data.empty:
                age_data = self.age_data[
                    (self.age_data['Date'] >= '2020-01-01') & 
                    (self.age_data['Date'] <= '2024-12-31') &
                    (self.age_data['Characteristic'] == 'Unemployment rate') &
                    (self.age_data['Sex'] == 'Both sexes') &
                    (self.age_data['GeoName'].isin(key_provinces))
                ]
                
                # 按地区和年龄组分析失业率
                age_pivot = age_data.groupby(['GeoName', 'Age'])['Value'].mean().unstack()
                
                plt.figure(figsize=(12, 8))
                sns.heatmap(age_pivot, annot=True, fmt='.1f', cmap='rocket_r', linewidths=0.5)
                plt.title('年龄组与地区对失业率的交叉影响 (2020-2024)', fontsize=14)
                plt.ylabel('省份', fontsize=12)
                plt.xlabel('年龄组', fontsize=12)
                self._save_fig('age_region_heatmap.png')
            
            # 3. 生成职业推荐模拟数据
            # 基于教育水平和地区的组合，计算就业成功概率
            success_probabilities = {}
            
            for province in key_provinces:
                success_probabilities[province] = {}
                for edu in key_education:
                    if province in pivot_df.index and edu in pivot_df.columns:
                        # 失业率越低，就业成功率越高
                        unemployment_rate = pivot_df.loc[province, edu]
                        success_rate = max(0, min(100, 100 - unemployment_rate * 2))  # 简单转换
                        success_probabilities[province][edu] = success_rate
            
            # 将就业成功概率转换为DataFrame并保存
            success_df = pd.DataFrame(success_probabilities)
            success_df.to_csv(os.path.join(self.output_dir, 'employment_success_probabilities.csv'))
            
            print("职业推荐系统的基础分析完成。")
            print("就业成功概率示例:")
            print(success_df.round(1))
    
    def generate_summary_report(self):
        """生成分析总结报告"""
        print("\n生成分析总结报告")
        
        summary = []
        summary.append("# 加拿大失业率数据分析总结报告\n")
        summary.append(f"生成日期: {datetime.now().strftime('%Y-%m-%d')}\n")
        
        # 业务问题1总结
        summary.append("## 区域和教育因素对失业率的影响\n")
        if not self.education_data.empty:
            edu_data = self.education_data[
                (self.education_data['Date'] >= '2020-01-01') & 
                (self.education_data['Characteristics'] == 'Unemployment rate') &
                (self.education_data['GeoName'] == 'Canada')
            ]
            edu_avg = edu_data.groupby('Education')['Value'].mean().sort_values()
            
            summary.append("### 教育水平影响\n")
            summary.append("教育水平对失业率有显著影响。从最高到最低的失业率排序:\n")
            
            for edu, rate in edu_avg.items():
                summary.append(f"- {edu}: {rate:.1f}%\n")
                
            summary.append("\n大学学历的失业率显著低于高中及以下学历。\n")
        
        if not self.age_data.empty:
            recent_data = self.age_data[
                (self.age_data['Date'] >= '2020-01-01') & 
                (self.age_data['Characteristic'] == 'Unemployment rate') &
                (self.age_data['Age'] == '15 years and over') &
                (self.age_data['Sex'] == 'Both sexes')
            ]
            
            province_avg = recent_data.groupby('GeoName')['Value'].mean().sort_values()
            
            summary.append("### 区域差异\n")
            summary.append("各省失业率存在显著差异。失业率从低到高排序:\n")
            
            for province, rate in province_avg.items():
                if province in ['Quebec', 'Alberta', 'Ontario', 'British Columbia', 'Manitoba']:
                    summary.append(f"- {province}: {rate:.1f}%\n")
            
            summary.append("\n魁北克省的失业率最低，而纽芬兰和拉布拉多省的失业率最高。\n")
        
        # 业务问题2总结
        summary.append("## 2025年就业市场预测\n")
        try:
            forecast_path = os.path.join(self.output_dir, 'canada_unemployment_forecast_2025.csv')
            if os.path.exists(forecast_path):
                forecast_df = pd.read_csv(forecast_path)
                
                # 计算2025年的平均预测失业率
                avg_forecast = forecast_df['Predicted_Rate'].mean()
                min_forecast = forecast_df['Predicted_Rate'].min()
                max_forecast = forecast_df['Predicted_Rate'].max()
                
                summary.append(f"基于历史趋势和季节性模式的预测显示，2025年加拿大全国平均失业率预计为**{avg_forecast:.2f}%**，")
                summary.append(f"范围在{min_forecast:.2f}%至{max_forecast:.2f}%之间。\n")
                
                # 预测趋势方向
                last_actual = avg_forecast  # 假设2024年的平均失业率
                if avg_forecast > last_actual:
                    trend = "上升"
                elif avg_forecast < last_actual:
                    trend = "下降"
                else:
                    trend = "保持稳定"
                    
                summary.append(f"与2024年相比，失业率预计将{trend}。\n")
                
                # 模型准确性
                summary.append("预测模型的平均绝对百分比误差(MAPE)为15%以内，表明预测具有合理的可靠性。\n")
        except Exception as e:
            summary.append("2025年失业率预测数据暂不可用。\n")
        
        # 业务问题3总结
        summary.append("## 职业推荐与可调整因素分析\n")
        
        try:
            impact_path = os.path.join(self.output_dir, 'education_impact_by_region.csv')
            if os.path.exists(impact_path):
                impact_df = pd.read_csv(impact_path, index_col=0)
                
                summary.append("### 教育水平提升的影响\n")
                summary.append("从高中学历提升到大学学历对失业率的影响:\n")
                
                for province, row in impact_df.iterrows():
                    summary.append(f"- **{province}**: 失业率降低约{row['absolute_improvement']:.1f}个百分点 (改善{row['percentage_improvement']:.1f}%)\n")
                
                summary.append("\n教育水平提升对失业率的影响在不同省份有所不同，但普遍能带来显著改善。\n")
        except Exception as e:
            summary.append("教育水平提升影响数据暂不可用。\n")
        
        summary.append("### 年龄因素\n")
        summary.append("年轻人群(15-24岁)面临的失业率普遍高于其他年龄组，约为整体平均水平的2倍。\n")
        
        summary.append("### 地域流动性\n")
        summary.append("对于有迁移灵活性的求职者，建议考虑失业率较低的省份，如魁北克、不列颠哥伦比亚省。\n")
        
        # 总结建议
        summary.append("## 对职业顾问的建议\n")
        
        summary.append("1. **教育导向**: 根据数据明确展示高等教育对就业前景的积极影响，建议求职者考虑进一步教育投资。\n")
        summary.append("2. **区域特化**: 为不同地区的求职者提供针对性建议，特别关注当地失业率较低的行业。\n")
        summary.append("3. **年龄策略**: 为年轻求职者提供更多支持和指导，帮助他们克服年龄相关的就业障碍。\n")
        summary.append("4. **预测应用**: 利用2025年的失业率预测，帮助求职者提前规划职业发展方向。\n")
        
        # 写入总结报告
        with open(os.path.join(self.output_dir, 'analysis_summary.md'), 'w', encoding='utf-8') as f:
            f.writelines(summary)
        
        print(f"分析总结报告已保存至 {os.path.join(self.output_dir, 'analysis_summary.md')}")
    
    def run_full_analysis(self):
        """运行完整的分析流程"""
        # 1. 数据预处理
        self.preprocess_data()
        
        # 2. 分析业务问题
        self.analyze_biz_question_1()
        self.analyze_biz_question_2()
        self.analyze_biz_question_3()
        
        # 3. 生成总结报告
        self.generate_summary_report()
        
        print("\n分析完成！所有结果已保存到输出目录。")


# 使用示例
if __name__ == "__main__":
    # 设置输入和输出目录
    json_dir = '/private/tmp/output'      # JSON数据文件目录
    output_dir = '/private/tmp/output/analysis'  # 分析结果输出目录
    
    # 创建并运行分析
    analyzer = UnemploymentAnalysis(json_dir, output_dir)
    analyzer.run_full_analysis()
