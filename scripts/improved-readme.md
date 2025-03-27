# 加拿大失业率数据ETL处理

本工具提供了一套完整的ETL（提取-转换-加载）流程，用于将加拿大统计局（Statistics Canada）的CSV格式失业率数据转换为适用于React仪表板的JSON格式。

## 功能特点

- 处理大型CSV文件（>1GB）
- 适配统计局数据结构
- 将NaN值自动转换为null，确保JSON与React兼容
- 提供数据验证功能
- 使用相对路径处理文件位置

## 目录结构

```
canada-unemployment-dashboard/
├── canada_unemployment_data/    # 原始CSV数据目录
│   ├── 14100287.csv             # 省份失业率数据
│   ├── 14100023.csv             # 行业失业率数据
│   └── 14100310.csv             # 职业失业率数据
├── public/
│   └── data/                    # 转换后的JSON数据目录
│       ├── province.json        # 省份失业率数据
│       ├── alberta.json         # 艾伯塔省失业率数据
│       ├── city.json            # 城市失业率数据
│       └── ...                  # 其他JSON数据文件
└── scripts/                     # 脚本目录
    ├── csv_to_json_etl.py       # ETL主脚本
    └── json_validator.py        # JSON验证脚本
```

## 使用方法

### 1. ETL处理

运行以下命令将CSV数据转换为JSON格式：

```bash
cd scripts
python csv_to_json_etl.py
```

这将处理`canada_unemployment_data`目录中的CSV文件，并将转换后的JSON文件保存到`public/data`目录。

### 2. 数据验证

转换完成后，运行以下命令验证JSON数据：

```bash
cd scripts
python json_validator.py
```

验证脚本将检查所有生成的JSON文件的结构、空值、日期格式和数值类型。

## 输出JSON文件

处理后将生成以下JSON文件：

1. **province.json** - 加拿大各省份失业率数据
2. **alberta.json** - 艾伯塔省详细失业率数据
3. **city.json** - 加拿大主要城市失业率数据
4. **industry.json** - 按行业分类的失业率数据
5. **occupation.json** - 按职业分类的失业率数据
6. **education.json** - 按教育程度分类的失业率数据
7. **age.json** - 按年龄组分类的失业率数据
8. **sex.json** - 按性别分类的失业率数据
9. **region.json** - 按区域分类的失业率数据

## 数据字段说明

### province.json

```json
{
  "Date": "1976-01-01T00:00:00",  // 日期
  "GeoID": "59",                  // 地区ID
  "GeoName": "British Columbia",  // 地区名称
  "Characteristic": "Unemployment rate", // 特征指标
  "Sex": "Both sexes",            // 性别
  "Age": "15 years and over",     // 年龄组
  "Value": 8.5                    // 失业率值
}
```

### industry.json

```json
{
  "Date": "2001-01-01T00:00:00",  // 日期
  "GeoID": "2021A000011124",      // 地区ID
  "GeoName": "Canada",            // 地区名称
  "NAICS Description": "Total, all industries", // 行业描述
  "Characteristic": "Unemployment rate", // 特征指标
  "Sex": "Both sexes",            // 性别
  "Age": "15 years and over",     // 年龄组
  "Value": 12.6,                  // 失业率值
  "NAICS": ""                     // 行业代码
}
```

### occupation.json

```json
{
  "Date": "1987-01-01T00:00:00",  // 日期
  "GeoID": 48,                    // 地区ID
  "GeoName": "Alberta",           // 地区名称
  "Characteristics": "Unemployment rate", // 特征指标
  "NOC": "51-55",                 // 职业代码
  "NOC Description": "Occupations in art, culture, recreation and sport", // 职业描述
  "Sex": "Both sexes",            // 性别
  "Value": null                   // 失业率值，null表示无数据
}
```

## 注意事项

1. 所有NaN值已转换为null，确保与React兼容
2. 使用相对路径处理文件位置，脚本应在`scripts`目录下运行
3. 对于大文件（如14100287.csv，>1GB），处理可能需要较长时间，请耐心等待
4. 验证脚本可能会报告缺失值，但这是正常的，因为原始数据中存在空值

## 数据来源

所有数据来自加拿大统计局（Statistics Canada）的Labour Force Survey：

- 14100287：按省份分类的劳动力特征数据（月度，季节性调整）
- 14100023：按行业分类的劳动力特征数据（年度）
- 14100310：按职业分类的就业数据（月度，季节性调整）
