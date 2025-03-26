import pandas as pd
import numpy as np
import os
import json
from datetime import datetime

# 配置文件路径
DATA_DIR = "/Users/niuyp/Downloads/1410002201"
OUTPUT_DIR = "/Users/niuyp/Documents/github.com/alberta-dashboard/scripts/"
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

def clean_and_transform_data(dfs):
    """清洗并转换数据到目标格式"""
    if not dfs:
        return []
        
    # 合并所有DataFrame
    merged_df = pd.concat(dfs, ignore_index=True)
    
    # 选择并重命名列
    # 尝试找到匹配的列名
    column_mapping = {}
    if 'REF_DATE' in merged_df.columns:
        column_mapping['REF_DATE'] = 'Date'
    if 'DGUID' in merged_df.columns:
        column_mapping['DGUID'] = 'GeoID'
    if 'GEO' in merged_df.columns:
        column_mapping['GEO'] = 'GeoName'
    
    # 查找劳动力特征列
    labour_force_col = None
    for col in merged_df.columns:
        if 'Labour force' in col or 'Characteristic' in col:
            labour_force_col = col
            column_mapping[col] = 'Characteristics'
            break
            
    # 查找行业列
    industry_col = None
    for col in merged_df.columns:
        if 'North American Industry Classification System' in col or 'Industry' in col:
            industry_col = col
            column_mapping[col] = 'NAICS Description'
            break
    
    # 查找数值列
    value_col = None
    for col in merged_df.columns:
        if col == 'VALUE' or col == 'Value':
            value_col = col
            column_mapping[col] = 'Value'
            break
    
    # 重命名列
    df = merged_df.rename(columns=column_mapping)
    
    # 确保所有必需的列存在
    required_cols = ['Date', 'GeoID', 'GeoName', 'Characteristics', 'Value']
    missing_cols = [col for col in required_cols if col not in df.columns]
    
    if missing_cols:
        print(f"警告: 缺少必需列: {missing_cols}")
        print("可用列:", df.columns.tolist())
        # 尝试为缺失列添加默认值
        for col in missing_cols:
            df[col] = None
    
    # 处理日期格式
    if 'Date' in df.columns:
        df['Date'] = pd.to_datetime(df['Date'], errors='coerce').dt.strftime('%Y-%m-%dT00:00:00')
    
    # 筛选失业率数据
    unemployment_filter = df['Characteristics'].str.contains('Unemployment rate|Unemployment|失业率', case=False, na=False)
    df = df[unemployment_filter]
    
    # 选择需要的列
    result_df = df[required_cols].copy()
    
    # 处理NaN值和无效值
    result_df = result_df.replace([np.nan, np.inf, -np.inf], None)
    
    # 转换为正确格式的列表
    result_list = []
    for _, row in result_df.iterrows():
        record = {}
        for col in required_cols:
            if col == 'Value' and row[col] is not None:
                try:
                    record[col] = float(row[col])
                except (ValueError, TypeError):
                    record[col] = None
            else:
                record[col] = row[col]
        result_list.append(record)
    
    return result_list

def save_json(data, output_file):
    """将数据保存为JSON文件"""
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2, default=lambda x: None)
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
    
    # 将第一个DataFrame的列名打印出来
    if dfs[0].shape[0] > 0:
        print("第一个CSV文件的列名:", dfs[0].columns.tolist())
        print("第一行数据示例:", dfs[0].iloc[0].to_dict())
    
    # 转换数据为目标格式
    result_data = clean_and_transform_data(dfs)
    if not result_data:
        print("错误: 无法转换数据")
        return
    
    # 保存JSON文件
    success = save_json(result_data, OUTPUT_FILE)
    if success:
        print(f"成功转换 {len(result_data)} 条记录")
        print(f"文件已保存为: {OUTPUT_FILE}")
        # 显示数据样例
        if result_data:
            print("\n数据示例 (前2条记录):")
            for i, record in enumerate(result_data[:2]):
                print(f"记录 {i+1}:", json.dumps(record, ensure_ascii=False))
    else:
        print("转换失败")

if __name__ == "__main__":
    main()
