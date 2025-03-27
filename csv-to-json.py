import pandas as pd
import numpy as np
import os
import json
from datetime import datetime
import re

# 配置文件路径
DATA_DIR = "/Users/niuyp/Downloads/1410002201"
OUTPUT_DIR = "/Users/niuyp/Documents/github.com/canada-unemployment-dashboard/scripts/"
FILE_NAMES = [
    '1410002201_databaseLoadingData.csv',      # 15-24岁
    '1410002201_databaseLoadingData (1).csv',  # 25-54岁
    '1410002201_databaseLoadingData (2).csv'   # 55岁及以上
]
OUTPUT_FILE_NAME = "industry.json"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, OUTPUT_FILE_NAME)

def read_csv_files(directory, file_names):
    """读取多个CSV文件并返回DataFrame列表"""
    dfs = []
    for file_name in file_names:
        file_path = os.path.join(directory, file_name)
        try:
            df = pd.read_csv(file_path)
            print(f"成功读取文件: {file_name}")
            dfs.append(df)
        except Exception as e:
            print(f"读取文件 {file_name} 出错: {e}")
    return dfs

def clean_industry_name(name):
    """清理行业名称，去除代码部分"""
    if not name:
        return name
    return re.sub(r'\s*\[[^\]]+\]', '', name).strip()

def process_to_json_format(dfs):
    """将CSV数据处理为JSON格式"""
    if not dfs:
        return []
        
    # 合并所有DataFrame
    merged_df = pd.concat(dfs, ignore_index=True)
    
    # 打印列名，帮助调试
    print("所有列名:", merged_df.columns.tolist())
    
    # 查找必要列
    industry_col = None
    for col in merged_df.columns:
        if 'North American Industry' in col:
            industry_col = col
            break
    
    labor_force_col = None
    for col in merged_df.columns:
        if 'Labour force' in col:
            labor_force_col = col
            break
    
    # 确保找到了必要的列
    if not industry_col or not labor_force_col:
        print(f"缺少必要列: industry_col={industry_col}, labor_force_col={labor_force_col}")
        return []
    
    # 筛选失业率数据
    unemployment_filter = merged_df[labor_force_col].str.contains('Unemployment rate', case=False, na=False)
    filtered_df = merged_df[unemployment_filter].copy()
    
    print(f"筛选出 {filtered_df.shape[0]} 条失业率数据")
    
    # 准备用于最终JSON的数据
    result = []
    for _, row in filtered_df.iterrows():
        # 创建记录
        date_str = row['REF_DATE']
        try:
            date = pd.to_datetime(date_str)
            
            # 处理数值
            value = row['VALUE']
            if pd.isna(value):
                value = None
            else:
                try:
                    value = float(value)
                except (ValueError, TypeError):
                    value = None
            
            # 提取和清理行业名称
            industry_name = row[industry_col]
            clean_name = clean_industry_name(industry_name)
            
            # 提取NAICS代码
            naics_code = ""
            code_match = re.search(r'\[([^\]]+)\]', str(industry_name))
            if code_match:
                naics_code = code_match.group(1)
            
            # 创建标准格式记录
            record = {
                "Date": date.strftime('%Y-%m-%dT00:00:00'),
                "GeoID": row['DGUID'],
                "GeoName": row['GEO'],
                "NAICS": naics_code,
                "NAICS Description": clean_name,
                "Characteristic": "Unemployment rate",
                "Sex": "Both sexes", # 假设这个字段
                "Age": "15 years and over", # 假设这个字段
                "Value": value
            }
            
            result.append(record)
        except Exception as e:
            print(f"处理记录时出错: {e}")
            continue
    
    print(f"成功创建 {len(result)} 条记录")
    
    # 打印样例记录
    if result:
        print("样例记录:", json.dumps(result[0], indent=2))
    
    return result

def save_json(data, output_file):
    """将数据保存为JSON文件"""
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"数据已成功保存到 {output_file}")
        return True
    except Exception as e:
        print(f"保存JSON文件时出错: {e}")
        return False

def main():
    """主函数: 读取CSV，处理数据，保存为JSON"""
    print("开始处理数据...")
    
    # 创建输出目录
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    # 读取CSV文件
    dfs = read_csv_files(DATA_DIR, FILE_NAMES)
    if not dfs:
        print("错误: 无法读取任何CSV文件")
        return
    
    # 处理数据为JSON格式
    result_data = process_to_json_format(dfs)
    if not result_data:
        print("错误: 无法处理数据")
        return
    
    # 保存JSON文件
    success = save_json(result_data, OUTPUT_FILE)
    if success:
        print(f"成功转换 {len(result_data)} 条记录")
        print(f"文件已保存为: {OUTPUT_FILE}")
    else:
        print("转换失败")

if __name__ == "__main__":
    main()
