import os
import pandas as pd
import numpy as np
import json
import glob
from datetime import datetime

def convert_csv_to_json(input_dir, output_dir):
    """
    将Statistics Canada的CSV文件转换为指定格式的JSON文件
    
    参数:
        input_dir: CSV文件所在目录
        output_dir: 输出JSON文件的目录
    """
    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)
    
    # 获取所有CSV文件
    csv_files = glob.glob(os.path.join(input_dir, '1410001901_databaseLoadingData*.csv'))
    print(f"找到{len(csv_files)}个CSV文件")
    
    # 初始化空的DataFrame用于合并数据
    combined_df = pd.DataFrame()
    
    # 读取并合并所有CSV文件
    for file_path in csv_files:
        print(f"处理文件: {os.path.basename(file_path)}")
        try:
            df = pd.read_csv(file_path)
            combined_df = pd.concat([combined_df, df], ignore_index=True)
        except Exception as e:
            print(f"处理文件时出错 {os.path.basename(file_path)}: {e}")
    
    print(f"合并后共有{len(combined_df)}条记录")
    
    # GeoID和GeoName的映射
    geo_mapping = {
        'Canada': {'id': '01', 'name': 'Canada'},
        'Newfoundland and Labrador': {'id': '10', 'name': 'Newfoundland and Labrador'},
        'Prince Edward Island': {'id': '11', 'name': 'Prince Edward Island'},
        'Nova Scotia': {'id': '12', 'name': 'Nova Scotia'},
        'New Brunswick': {'id': '13', 'name': 'New Brunswick'},
        'Quebec': {'id': '24', 'name': 'Quebec'},
        'Ontario': {'id': '35', 'name': 'Ontario'},
        'Manitoba': {'id': '46', 'name': 'Manitoba'},
        'Saskatchewan': {'id': '47', 'name': 'Saskatchewan'},
        'Alberta': {'id': '48', 'name': 'Alberta'},
        'British Columbia': {'id': '59', 'name': 'British Columbia'},
        'Yukon': {'id': '60', 'name': 'Territories'},
        'Northwest Territories': {'id': '60', 'name': 'Territories'},
        'Nunavut': {'id': '60', 'name': 'Territories'}
    }
    
    # 处理日期格式的函数
    def format_date(date_str):
        try:
            # 处理不同格式的日期，标准化为ISO格式 (YYYY-MM-01T00:00:00)
            if isinstance(date_str, str) and len(date_str) >= 7:
                year_month = date_str[:7]
                return f"{year_month}-01T00:00:00"
            else:
                return str(date_str) + "-01T00:00:00"
        except:
            return str(date_str) + "-01T00:00:00"
    
    # 处理地区名称的函数
    def map_geo(geo_str):
        # 处理缩写和全名的映射
        geo_abbr_mapping = {
            'Alta.': 'Alberta',
            'B.C.': 'British Columbia',
            'Man.': 'Manitoba',
            'N.B.': 'New Brunswick',
            'N.L.': 'Newfoundland and Labrador',
            'N.S.': 'Nova Scotia',
            'Ont.': 'Ontario',
            'P.E.I.': 'Prince Edward Island',
            'Que.': 'Quebec',
            'Sask.': 'Saskatchewan',
            'Y.T., N.W.T. and Nvt.': 'Territories'
        }
        
        geo_std = geo_abbr_mapping.get(geo_str, geo_str)
        return geo_mapping.get(geo_std, {'id': '00', 'name': geo_std if isinstance(geo_std, str) else 'Unknown'})
    
    # 处理性别字段的函数
    def map_sex(gender_str):
        if not isinstance(gender_str, str):
            return 'Unknown'
            
        gender_mapping = {
            'Total - Gender': 'Both sexes',
            'Males': 'Males',
            'Females': 'Females'
        }
        return gender_mapping.get(gender_str, gender_str)
    
    # 处理数值的函数，避免NaN
    def safe_value(value):
        if pd.isna(value) or np.isnan(value):
            return None
        return value
    
    # 1. 生成age.json
    age_data = []
    # 筛选与年龄组相关的失业率数据
    age_df = combined_df[
        (combined_df['Labour force characteristics'].str.contains('Unemployment', case=False, na=False)) & 
        (~combined_df['Age group'].isna())
    ].copy()
    
    for _, row in age_df.iterrows():
        try:
            # 获取地区信息
            geo_info = map_geo(row['GEO'])
            
            # 标准化性别信息
            sex = map_sex(row['Gender'])
            
            # 安全处理VALUE字段
            value = safe_value(row['VALUE'])
            
            # 创建数据记录
            record = {
                "Date": format_date(row['REF_DATE']),
                "GeoID": geo_info['id'],
                "GeoName": geo_info['name'],
                "Characteristic": row['Labour force characteristics'] if isinstance(row['Labour force characteristics'], str) else 'Unknown',
                "Sex": sex,
                "Age": row['Age group'] if isinstance(row['Age group'], str) else 'Unknown',
                "Value": value
            }
            age_data.append(record)
        except Exception as e:
            print(f"处理年龄数据记录时出错: {e}")
    
    # 保存age.json
    age_json_path = os.path.join(output_dir, 'age.json')
    with open(age_json_path, 'w', encoding='utf-8') as f:
        json.dump(age_data, f, indent=2)
    print(f"已保存{len(age_data)}条年龄相关记录到 {age_json_path}")
    
    # 2. 生成education.json
    education_data = []
    # 筛选与教育程度相关的失业率数据
    edu_df = combined_df[
        (combined_df['Labour force characteristics'].str.contains('Unemployment', case=False, na=False)) & 
        (~combined_df['Educational attainment'].isna())
    ].copy()
    
    for _, row in edu_df.iterrows():
        try:
            # 获取地区信息
            geo_info = map_geo(row['GEO'])
            
            # 标准化性别信息
            sex = map_sex(row['Gender'])
            
            # 安全处理VALUE字段
            value = safe_value(row['VALUE'])
            
            # 创建数据记录
            record = {
                "Date": format_date(row['REF_DATE']),
                "GeoID": geo_info['id'],
                "GeoName": geo_info['name'],
                "Characteristics": row['Labour force characteristics'] if isinstance(row['Labour force characteristics'], str) else 'Unknown',
                "Education": row['Educational attainment'] if isinstance(row['Educational attainment'], str) else 'Unknown',
                "Sex": sex,
                "Age": row['Age group'] if isinstance(row['Age group'], str) else 'Unknown',
                "Value": value
            }
            education_data.append(record)
        except Exception as e:
            print(f"处理教育数据记录时出错: {e}")
    
    # 保存education.json
    edu_json_path = os.path.join(output_dir, 'education.json')
    with open(edu_json_path, 'w', encoding='utf-8') as f:
        json.dump(education_data, f, indent=2)
    print(f"已保存{len(education_data)}条教育相关记录到 {edu_json_path}")
    
    # 验证JSON文件的有效性
    try:
        with open(age_json_path, 'r', encoding='utf-8') as f:
            json.load(f)
        print("age.json 是有效的JSON文件")
    except json.JSONDecodeError as e:
        print(f"age.json 无效: {e}")
    
    try:
        with open(edu_json_path, 'r', encoding='utf-8') as f:
            json.load(f)
        print("education.json 是有效的JSON文件")
    except json.JSONDecodeError as e:
        print(f"education.json 无效: {e}")
    
    return {
        'age_count': len(age_data),
        'education_count': len(education_data)
    }

if __name__ == "__main__":
    # 设置输入和输出目录
    input_dir = '/private/tmp/1410001901'  # 更新为你的实际输入目录
    output_dir = '/private/tmp/output'     # 更新为你的实际输出目录
    
    # 执行转换
    result = convert_csv_to_json(input_dir, output_dir)
    print(f"转换完成! 生成了 {result['age_count']} 条年龄相关记录和 {result['education_count']} 条教育相关记录")
