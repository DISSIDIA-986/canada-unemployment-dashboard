import requests
import json
import os
from pathlib import Path

# 创建数据目录
data_dir = Path('data')
data_dir.mkdir(exist_ok=True)

# 定义数据源
data_sources = {
    "alberta": "https://api.economicdata.alberta.ca/api/data?code=c1fe936a-324a-4a37-bfde-eeb3bb3d7c8c",
    "province": "https://api.economicdata.alberta.ca/api/data?code=66655abe-d760-40ce-8d74-705d2e73ebe4",
    "industry": "https://api.economicdata.alberta.ca/api/data?code=4f4e4ffb-6589-44fe-bfaa-bfc9c11def06",
    "sex": "https://api.economicdata.alberta.ca/api/data?code=b8c1b3f4-a403-4d90-a46a-c2d875072c83",
    "age": "https://api.economicdata.alberta.ca/api/data?code=dac568c8-bfa4-400c-9dc9-5414b5317a56",
    "city": "https://api.economicdata.alberta.ca/api/data?code=4bdfe07f-ff1c-4ace-9af6-93e6490b4a4f",
    "region": "https://api.economicdata.alberta.ca/api/data?code=49050dbd-759e-4791-b3c0-0d8a5c0a1e15",
    "occupation": "https://api.economicdata.alberta.ca/api/data?code=da86e41f-0fef-44c0-8770-297f8e8de11c",
    "education": "https://api.economicdata.alberta.ca/api/data?code=3a8c5bb5-ecea-45c1-95dc-2a19f00a819c"
}

# 下载数据
for name, url in data_sources.items():
    print(f"正在下载 {name} 数据...")
    
    try:
        response = requests.get(url)
        response.raise_for_status()  # 如果请求失败则抛出异常
        
        data = response.json()
        
        # 保存为JSON文件
        file_path = data_dir / f"{name}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
            
        print(f"✓ 已保存到 {file_path}")
        
    except Exception as e:
        print(f"✗ 下载 {name} 数据失败: {str(e)}")

print("\n数据下载完成。")
