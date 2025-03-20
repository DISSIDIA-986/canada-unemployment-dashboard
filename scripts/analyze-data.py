import json
import os
from collections import defaultdict

# 数据文件列表
data_files = ['alberta.json', 'province.json', 'industry.json', 'sex.json', 
              'age.json', 'city.json', 'region.json', 'occupation.json', 'education.json']

# 存储各文件的字段信息
file_fields = {}
field_values = defaultdict(set)

for filename in data_files:
    try:
        with open(f'./data/{filename}', 'r') as file:
            data = json.load(file)
            
            # 确保数据是列表形式
            if not isinstance(data, list):
                data = [data]
            
            # 收集字段信息
            file_fields[filename] = set()
            for item in data:
                for field in item.keys():
                    file_fields[filename].add(field)
                    
                # 收集特定字段的值
                for field in ['GeoName', 'Characteristic', 'Characteristics', 'Sex', 'Age', 'Education', 'NAICS Description', 'NOC Description']:
                    if field in item and item[field] is not None:
                        field_values[field].add(item[field])
                        
    except Exception as e:
        print(f"Error processing {filename}: {e}")

# 打印结果
print("=== 各文件字段信息 ===")
for filename, fields in file_fields.items():
    print(f"\n{filename}:")
    for field in sorted(fields):
        print(f"  - {field}")

print("\n\n=== 字段值信息 ===")
for field, values in field_values.items():
    if values:
        print(f"\n{field}:")
        for value in sorted(values):
            print(f"  - {value}")

# 分析不同文件中的特征字段
print("\n\n=== 数据维度分析 ===")
unemployment_files = {
    'Province': 'province.json',
    'Industry': 'industry.json',
    'Sex': 'sex.json',
    'Age': 'age.json',
    'City': 'city.json',
    'Region': 'region.json',
    'Occupation': 'occupation.json',
    'Education': 'education.json'
}

for dimension, filename in unemployment_files.items():
    if filename in file_fields:
        specific_fields = []
        for field in file_fields[filename]:
            if field not in ['Date', 'GeoID', 'GeoName', 'Value']:
                specific_fields.append(field)
        
        print(f"{dimension} 维度特有字段: {', '.join(specific_fields)}")
