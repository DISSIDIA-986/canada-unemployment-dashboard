import pandas as pd
import json
import re
import numpy as np
from datetime import datetime

def clean_industry_name(name):
    """清理行业名称,移除代码部分"""
    if isinstance(name, str) and '[' in name:
        return re.sub(r'\s*\[\d+.*?\]', '', name).strip()
    return name

# Added helper to safely convert values (handles NaN)
def safe_convert_value(val):
    value = float(val)
    if pd.isna(value):
        return None
    elif value == int(value):
        return int(value)
    else:
        return value

def convert_csv_to_json(csv_file, output_json_file):
    """
    将CSV数据转换为单个JSON文件
    
    参数:
        csv_file: CSV文件路径
        output_json_file: 输出JSON文件路径
    """
    print(f"开始处理文件: {csv_file}")
    
    # 读取CSV文件
    df = pd.read_csv(csv_file)
    
    # 确保VALUE列为数值类型
    df['VALUE'] = pd.to_numeric(df['VALUE'], errors='coerce')
    
    # 将REF_DATE转为日期格式
    df['REF_DATE'] = pd.to_datetime(df['REF_DATE'] + '-01', format='%Y-%m-%d', errors='coerce')
    
    # 清理行业名称
    naics_col = 'North American Industry Classification System (NAICS)'
    df[naics_col] = df[naics_col].apply(clean_industry_name)
    
    # 创建一个综合JSON结构,包含多个部分
    result = {
        'metadata': {
            'source': 'Statistics Canada - Labour Force Survey',
            'date_generated': datetime.now().strftime('%Y-%m-%d'),
            'description': 'Job vacancies, payroll employees, and job vacancy rate by industry sector'
        },
        'latest_data': {},
        'time_series': {},
        'industry_data': {},
        'provincial_data': {}
    }
    
    # 处理最新日期的汇总数据
    latest_date = df['REF_DATE'].max()
    latest_df = df[df['REF_DATE'] == latest_date]
    latest_date_str = latest_date.strftime('%Y-%m')
    
    result['latest_data']['date'] = latest_date_str
    result['latest_data']['industries'] = []
    
    # 获取唯一行业列表
    industries = df[naics_col].unique()
    
    # 生成最新的行业数据
    for industry in industries:
        industry_latest = latest_df[latest_df[naics_col] == industry]
        
        if len(industry_latest) > 0:
            entry = {'industry': industry}
            
            # 添加各统计指标
            for stat_type in ['Job vacancies', 'Payroll employees', 'Job vacancy rate']:
                stat_rows = industry_latest[industry_latest['Statistics'] == stat_type]
                if len(stat_rows) > 0:
                    key = stat_type.lower().replace(' ', '_')
                    entry[key] = safe_convert_value(stat_rows['VALUE'].iloc[0])
            
            result['latest_data']['industries'].append(entry)
    
    # 按空缺率排序
    result['latest_data']['industries'].sort(key=lambda x: x.get('job_vacancy_rate', 0), reverse=True)
    
    # 处理时间序列数据 - 所有行业合并
    all_dates = sorted(df['REF_DATE'].unique())
    time_series_all = []
    
    for date in all_dates:
        date_str = date.strftime('%Y-%m')
        date_df = df[df['REF_DATE'] == date]
        
        entry = {'date': date_str}
        
        # 只获取'Total, all industries'的数据作为整体数据
        total_industry = 'Total, all industries'
        total_df = date_df[date_df[naics_col] == total_industry]
        
        for stat_type in ['Job vacancies', 'Payroll employees', 'Job vacancy rate']:
            stat_rows = total_df[total_df['Statistics'] == stat_type]
            if len(stat_rows) > 0:
                key = stat_type.lower().replace(' ', '_')
                entry[key] = safe_convert_value(stat_rows['VALUE'].iloc[0])
        
        time_series_all.append(entry)
    
    result['time_series']['all_industries'] = time_series_all
    
    # 处理每个行业的时间序列数据
    for industry in industries:
        # 跳过总计行业,因为我们已经在all_industries中包含了
        if industry == 'Total, all industries':
            continue
            
        industry_df = df[df[naics_col] == industry]
        industry_key = industry.lower().replace(' ', '_').replace(',', '').replace('(', '').replace(')', '')
        
        time_series = []
        
        for date in all_dates:
            date_str = date.strftime('%Y-%m')
            date_data = industry_df[industry_df['REF_DATE'] == date]
            
            if len(date_data) > 0:
                entry = {'date': date_str}
                
                for stat_type in ['Job vacancies', 'Payroll employees', 'Job vacancy rate']:
                    stat_rows = date_data[date_data['Statistics'] == stat_type]
                    if len(stat_rows) > 0:
                        key = stat_type.lower().replace(' ', '_')
                        entry[key] = safe_convert_value(stat_rows['VALUE'].iloc[0])
                
                time_series.append(entry)
        
        if time_series:
            result['time_series'][industry_key] = time_series
    
    # 处理行业比较数据
    result['industry_data']['vacancy_rates'] = []
    result['industry_data']['vacancy_counts'] = []
    
    # 最新日期的行业数据(排除总计)
    latest_industry_data = [
        item for item in result['latest_data']['industries'] 
        if item['industry'] != 'Total, all industries'
    ]
    
    # 按空缺率排序
    vacancy_rates = sorted(
        latest_industry_data, 
        key=lambda x: x.get('job_vacancy_rate', 0), 
        reverse=True
    )
    
    # 按职位空缺数排序
    vacancy_counts = sorted(
        latest_industry_data, 
        key=lambda x: x.get('job_vacancies', 0), 
        reverse=True
    )
    
    result['industry_data']['vacancy_rates'] = vacancy_rates
    result['industry_data']['vacancy_counts'] = vacancy_counts
    
    # 处理省份数据(如果有)
    if 'GEO' in df.columns:
        provinces = df['GEO'].unique()
        result['provincial_data']['regions'] = list(provinces)
        
        # 可以添加按省份的分析,但当前数据可能只有Canada整体数据
    
    # 添加行业分类
    result['industry_classifications'] = []
    for industry in industries:
        if industry != 'Total, all industries':
            # 提取行业代码(如果有)
            code = ''
            if '[' in industry and ']' in industry:
                code_match = re.search(r'\[(.*?)\]', industry)
                if code_match:
                    code = code_match.group(1)
            
            result['industry_classifications'].append({
                'name': clean_industry_name(industry),
                'code': code,
                'full_name': industry
            })
    
    # 将结果写入JSON文件
    with open(output_json_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"成功转换数据并保存到: {output_json_file}")
    print(f"JSON包含 {len(result['latest_data']['industries'])} 个行业的数据")
    print(f"时间序列数据涵盖从 {time_series_all[0]['date']} 到 {time_series_all[-1]['date']} 的期间")
    
    return result

if __name__ == "__main__":
    # 指定输入CSV文件和输出JSON文件
    input_csv = "https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/14100372-eng/14100372.csv"
    output_json = "/tmp/vacancy_data.json"
    
    # 执行转换
    convert_csv_to_json(input_csv, output_json)
