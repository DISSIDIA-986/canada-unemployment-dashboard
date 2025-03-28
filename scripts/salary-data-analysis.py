import requests
import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

def analyze_salary_data(url):
    """分析薪资数据JSON并检查潜在问题"""
    
    print("正在获取数据...")
    response = requests.get(url)
    data = response.json()
    
    print(f"数据总量: {len(data)} 条记录")
    
    # 转换为pandas DataFrame便于分析
    df = pd.DataFrame(data)
    
    # 基本信息
    print("\n基本信息:")
    print(f"数据包含的字段: {', '.join(df.columns.tolist())}")
    
    # 检查Reference_Period的类型
    print("\nReference_Period字段类型分析:")
    period_types = df['Reference_Period'].apply(type).value_counts()
    print(period_types)
    
    # 检查Reference_Period分布，处理不同类型问题
    print("\n年份分布:")
    # 将所有值都转为字符串，避免比较类型问题
    year_values = df['Reference_Period'].astype(str).value_counts()
    print(year_values)
    
    # 将非数字、非None的年份值打印出来查看
    non_numeric = []
    numeric_years = []
    
    for val in df['Reference_Period'].unique():
        if val is None:
            continue
        try:
            numeric_years.append(int(val))
        except (ValueError, TypeError):
            non_numeric.append(val)
    
    print("\n非数字年份值:", non_numeric)
    
    # 检查省份分布
    print("\n省份分布:")
    prov_counts = df['prov'].value_counts()
    print(prov_counts)
    
    # 检查最低工资的分布
    print("\n最低工资(Low_Wage_Salaire_Minium)分析:")
    low_wage_stats = df['Low_Wage_Salaire_Minium'].describe()
    print(low_wage_stats)
    
    # 过滤出2021年数据，注意处理不同类型
    df_2021 = df[df['Reference_Period'].astype(str) == '2021']
    print(f"\n2021年数据量: {len(df_2021)} 条记录")
    
    # 检查最低工资频率分布
    low_wage_counts = df_2021['Low_Wage_Salaire_Minium'].value_counts().sort_index()
    print("\n2021年最低工资前10个频率:")
    print(low_wage_counts.head(10))
    
    # 计算重复值的比例
    if not low_wage_counts.empty:
        most_common_low_wage = low_wage_counts.idxmax()
        percentage = (low_wage_counts.max() / len(df_2021)) * 100
        print(f"\n最常见的最低工资值 ${most_common_low_wage} 出现 {low_wage_counts.max()} 次 ({percentage:.2f}%)")
    
        # 检查最低工资为32360的记录
        wage_32360 = df_2021[df_2021['Low_Wage_Salaire_Minium'] == 32360]
        print(f"\n最低工资为32360的记录数: {len(wage_32360)}")
        
        # 抽样查看这些记录
        if len(wage_32360) > 0:
            print("\n抽样查看最低工资为32360的记录:")
            sample_cols = ['NOC_Title_eng', 'prov', 'ER_Name', 'Low_Wage_Salaire_Minium', 'Median_Wage_Salaire_Median', 'High_Wage_Salaire_Maximal']
            print(wage_32360[sample_cols].sample(min(5, len(wage_32360))))
    
    # 职业与最低工资的关系
    nat_data = df_2021[df_2021['prov'] == 'NAT']
    print(f"\n全国数据中2021年记录数: {len(nat_data)}")
    
    if len(nat_data) > 0:
        print("\n全国数据中的前10个职业最低工资:")
        nat_occupations = nat_data.groupby('NOC_Title_eng')['Low_Wage_Salaire_Minium'].first().sort_values()
        print(nat_occupations.head(10))
        
        # 检查全国数据中最低工资的独特值
        unique_low_wages = nat_data['Low_Wage_Salaire_Minium'].unique()
        print(f"\n全国数据中最低工资的独特值数量: {len(unique_low_wages)}")
        print(f"最低工资值范围: {min(unique_low_wages)} 到 {max(unique_low_wages)}")
        
        # 检查重复的值
        low_wage_value_counts = nat_data['Low_Wage_Salaire_Minium'].value_counts()
        print("\n全国数据中最低工资重复次数最多的10个值:")
        print(low_wage_value_counts.head(10))
    
        try:
            # 可视化
            plt.figure(figsize=(12, 6))
            sns.histplot(df_2021['Low_Wage_Salaire_Minium'].dropna(), bins=30)
            plt.title('2021年最低工资分布')
            plt.xlabel('最低工资')
            plt.ylabel('频率')
            plt.tight_layout()
            plt.savefig('low_wage_distribution_2021.png')
            print("\n已保存最低工资分布图到low_wage_distribution_2021.png")
        except Exception as e:
            print(f"生成图表出错: {e}")
    
    # 检查各省份薪资数据情况
    print("\n各省份2021年数据情况:")
    try:
        province_stats = df_2021.groupby('prov').agg({
            'Low_Wage_Salaire_Minium': ['mean', 'min', 'max', 'count'],
            'Median_Wage_Salaire_Median': ['mean', 'min', 'max', 'count'],
            'High_Wage_Salaire_Maximal': ['mean', 'min', 'max', 'count']
        })
        print(province_stats)
    except Exception as e:
        print(f"计算省份统计数据出错: {e}")
    
    # 检查相同职业在不同省份的最低工资差异
    try:
        # 使用更稳健的方法计算职业和省份之间的关系
        print("\n相同职业在不同省份的最低工资差异:")
        occupation_prov_data = []
        
        for occ in df_2021['NOC_Title_eng'].unique():
            occ_data = df_2021[df_2021['NOC_Title_eng'] == occ]
            provinces = occ_data['prov'].unique()
            
            if len(provinces) > 1:
                min_wages = []
                for prov in provinces:
                    prov_data = occ_data[occ_data['prov'] == prov]
                    if not prov_data.empty and not pd.isna(prov_data['Low_Wage_Salaire_Minium'].iloc[0]):
                        min_wages.append((prov, prov_data['Low_Wage_Salaire_Minium'].iloc[0]))
                
                if len(set(w for _, w in min_wages)) > 1:
                    occupation_prov_data.append({
                        'occupation': occ,
                        'provinces': len(provinces),
                        'min_wages': min_wages,
                        'wage_variation': max(w for _, w in min_wages) - min(w for _, w in min_wages)
                    })
        
        # 按工资变化排序
        occupation_prov_data.sort(key=lambda x: x['wage_variation'], reverse=True)
        
        print(f"有 {len(occupation_prov_data)} 个职业在不同省份有不同的最低工资")
        
        if occupation_prov_data:
            print("\n最大最低工资差异的前5个职业:")
            for i, data in enumerate(occupation_prov_data[:5]):
                print(f"{i+1}. {data['occupation']}")
                for prov, wage in data['min_wages']:
                    print(f"   - {prov}: ${wage}")
                print(f"   差异: ${data['wage_variation']}")
    except Exception as e:
        print(f"分析职业/省份数据出错: {e}")
    
    # 返回分析结果
    print("\n数据分析完成!")
    
    return df

if __name__ == "__main__":
    url = "https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/json-data/salary.json"
    try:
        df = analyze_salary_data(url)
        
        # 保存数据样本到CSV以便进一步检查
        df.sample(min(100, len(df))).to_csv('salary_data_sample.csv', index=False)
        print("已保存样本数据到salary_data_sample.csv")
        
        # 特别检查最低工资为32360的记录
        wage_32360 = df[df['Low_Wage_Salaire_Minium'] == 32360]
        if len(wage_32360) > 0:
            wage_32360.to_csv('wage_32360_records.csv', index=False)
            print(f"已保存{len(wage_32360)}条最低工资为32360的记录到wage_32360_records.csv")
    except Exception as e:
        print(f"程序执行出错: {e}")