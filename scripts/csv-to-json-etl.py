import pandas as pd
import json
import os
import logging
import numpy as np
from datetime import datetime
from typing import Dict, List, Optional, Union, Any

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('csv_to_json_etl')

class UnemploymentDataETL:
    """失业率数据ETL处理类"""
    
    def __init__(self, input_dir: str = "../canada_unemployment_data", output_dir: str = "../public/data"):
        """
        初始化ETL处理器
        
        Args:
            input_dir: 输入目录，包含CSV文件
            output_dir: 输出目录，用于保存JSON文件
        """
        # 使用相对路径
        script_dir = os.path.dirname(os.path.abspath(__file__))
        self.input_dir = os.path.normpath(os.path.join(script_dir, input_dir))
        self.output_dir = os.path.normpath(os.path.join(script_dir, output_dir))
        os.makedirs(self.output_dir, exist_ok=True)
        logger.info(f"初始化ETL处理器，输入目录: {self.input_dir}, 输出目录: {self.output_dir}")
    
    def load_csv(self, file_path: str) -> Optional[pd.DataFrame]:
        """
        加载CSV文件
        
        Args:
            file_path: CSV文件路径
            
        Returns:
            DataFrame对象，如果加载失败则返回None
        """
        try:
            full_path = os.path.join(self.input_dir, file_path) if not os.path.isabs(file_path) else file_path
            if not os.path.exists(full_path):
                logger.error(f"文件不存在: {full_path}")
                return None
                
            # 使用低内存模式和适当的类型推断加载大文件
            df = pd.read_csv(full_path, encoding='utf-8', low_memory=False, dtype={
                'VALUE': 'float64',
                'SCALAR_FACTOR': 'str',
                'STATUS': 'str',
                'SYMBOL': 'str',
                'TERMINATED': 'str',
                'DECIMALS': 'int64'
            })
            logger.info(f"加载CSV文件 {file_path} 成功，形状: {df.shape}")
            return df
        except Exception as e:
            logger.error(f"加载CSV文件 {file_path} 失败: {e}")
            return None
    
    def clean_column_names(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        清理列名，移除空格和特殊字符
        
        Args:
            df: 输入DataFrame
            
        Returns:
            处理后的DataFrame
        """
        df.columns = df.columns.str.strip()
        return df
    
    def format_date(self, df: pd.DataFrame, date_col: str = "REF_DATE") -> pd.DataFrame:
        """
        格式化日期列
        
        Args:
            df: 输入DataFrame
            date_col: 日期列名
            
        Returns:
            处理后的DataFrame
        """
        if date_col in df.columns:
            try:
                # 尝试将日期列转换为datetime格式
                df[date_col] = pd.to_datetime(df[date_col])
                # 将日期格式化为ISO格式字符串
                df[date_col] = df[date_col].dt.strftime('%Y-%m-%dT%H:%M:%S')
                logger.info(f"日期列 {date_col} 格式化成功")
            except Exception as e:
                logger.warning(f"日期列 {date_col} 格式化失败: {e}")
        return df
    
    def rename_columns(self, df: pd.DataFrame, column_mapping: Dict[str, str]) -> pd.DataFrame:
        """
        重命名列
        
        Args:
            df: 输入DataFrame
            column_mapping: 列映射字典，格式为 {原列名: 新列名}
            
        Returns:
            处理后的DataFrame
        """
        # 筛选出实际存在的列
        valid_mapping = {old: new for old, new in column_mapping.items() if old in df.columns}
        if valid_mapping:
            df = df.rename(columns=valid_mapping)
            logger.info(f"重命名列成功: {valid_mapping}")
        return df
    
    def filter_rows(self, df: pd.DataFrame, filters: Dict[str, Union[str, List[str]]]) -> pd.DataFrame:
        """
        过滤行
        
        Args:
            df: 输入DataFrame
            filters: 过滤条件，格式为 {列名: 值或值列表}
            
        Returns:
            过滤后的DataFrame
        """
        for col, values in filters.items():
            if col in df.columns:
                if isinstance(values, list):
                    df = df[df[col].isin(values)]
                else:
                    df = df[df[col] == values]
                logger.info(f"应用过滤条件 {col}: {values}, 剩余行数: {len(df)}")
        return df
    
    def select_columns(self, df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
        """
        选择列
        
        Args:
            df: 输入DataFrame
            columns: 要选择的列名列表
            
        Returns:
            选择后的DataFrame
        """
        # 筛选出实际存在的列
        valid_columns = [col for col in columns if col in df.columns]
        if valid_columns:
            df = df[valid_columns]
            logger.info(f"选择列成功: {valid_columns}")
        return df
    
    def transform_value(self, df: pd.DataFrame, value_col: str = "VALUE") -> pd.DataFrame:
        """
        转换值列，确保数值类型正确，并将NaN替换为null
        
        Args:
            df: 输入DataFrame
            value_col: 值列名
            
        Returns:
            处理后的DataFrame
        """
        if value_col in df.columns:
            try:
                # 将值列转换为float类型
                df[value_col] = pd.to_numeric(df[value_col], errors='coerce')
                # 将NaN替换为None（在转为JSON时会变成null）
                df[value_col] = df[value_col].replace({np.nan: None})
                logger.info(f"值列 {value_col} 转换成功，NaN已替换为None")
            except Exception as e:
                logger.warning(f"值列 {value_col} 转换失败: {e}")
        return df
    
    def add_missing_columns(self, df: pd.DataFrame, required_columns: Dict[str, Any]) -> pd.DataFrame:
        """
        添加缺失的列
        
        Args:
            df: 输入DataFrame
            required_columns: 必需的列及其默认值，格式为 {列名: 默认值}
            
        Returns:
            处理后的DataFrame
        """
        for col, default_value in required_columns.items():
            if col not in df.columns:
                df[col] = default_value
                logger.info(f"添加缺失列 {col} 成功，默认值: {default_value}")
        return df
    
    def process_province_data(self, file_path: str) -> Optional[List[Dict]]:
        """
        处理省份失业率数据
        
        Args:
            file_path: CSV文件路径
            
        Returns:
            处理后的数据列表，如果处理失败则返回None
        """
        df = self.load_csv(file_path)
        if df is None:
            return None
        
        # 清理列名
        df = self.clean_column_names(df)
        
        # 列映射 - 根据截图中的实际列名调整
        column_mapping = {
            "REF_DATE": "Date",
            "GEO": "GeoName",
            "Labour force characteristics": "Characteristic",
            "Gender": "Sex",
            "Age group": "Age",
            "Statistics": "StatType",
            "VALUE": "Value"
        }
        df = self.rename_columns(df, column_mapping)
        
        # 过滤行 - 只保留失业率数据
        filters = {
            "Characteristic": ["Unemployment rate"]
        }
        df = self.filter_rows(df, filters)
        
        # 格式化日期
        df = self.format_date(df, date_col="Date")
        
        # 转换值列
        df = self.transform_value(df, value_col="Value")
        
        # 为每个省份设置正确的GeoID
        geo_id_mapping = {
            "Canada": "01",
            "Alberta": "48",
            "British Columbia": "59",
            "Manitoba": "46",
            "New Brunswick": "13",
            "Newfoundland and Labrador": "10",
            "Nova Scotia": "12",
            "Ontario": "35",
            "Prince Edward Island": "11",
            "Quebec": "24",
            "Saskatchewan": "47"
        }
        df["GeoID"] = df["GeoName"].map(geo_id_mapping)
        
        # 选择列
        columns = ["Date", "GeoID", "GeoName", "Characteristic", "Sex", "Age", "Value"]
        df = self.select_columns(df, columns)
        
        # 转换为字典列表
        result = df.to_dict(orient="records")
        logger.info(f"处理省份数据成功，共 {len(result)} 条记录")
        return result
    
    def process_alberta_data(self, file_path: str) -> Optional[List[Dict]]:
        """
        处理艾伯塔省失业率数据
        
        Args:
            file_path: CSV文件路径
            
        Returns:
            处理后的数据列表，如果处理失败则返回None
        """
        df = self.load_csv(file_path)
        if df is None:
            return None
        
        # 清理列名
        df = self.clean_column_names(df)
        
        # 列映射
        column_mapping = {
            "REF_DATE": "Date",
            "GEO": "GeoName",
            "Labour force characteristics": "Characteristic",
            "VALUE": "Value",
            "Sex": "Sex",
            "Age group": "Age"
        }
        df = self.rename_columns(df, column_mapping)
        
        # 过滤行 - 只保留艾伯塔省数据
        filters = {
            "GeoName": ["Alberta"]
        }
        df = self.filter_rows(df, filters)
        
        # 格式化日期
        df = self.format_date(df, date_col="Date")
        
        # 转换值列
        df = self.transform_value(df, value_col="Value")
        
        # 添加GeoID
        df["GeoID"] = 48
        
        # 选择列
        columns = ["Date", "GeoID", "GeoName", "Characteristic", "Sex", "Age", "Value"]
        df = self.select_columns(df, columns)
        
        # 转换为字典列表
        result = df.to_dict(orient="records")
        logger.info(f"处理艾伯塔省数据成功，共 {len(result)} 条记录")
        return result
    
    def process_city_data(self, file_path: str) -> Optional[List[Dict]]:
        """
        处理城市失业率数据
        
        Args:
            file_path: CSV文件路径
            
        Returns:
            处理后的数据列表，如果处理失败则返回None
        """
        df = self.load_csv(file_path)
        if df is None:
            return None
        
        # 清理列名
        df = self.clean_column_names(df)
        
        # 列映射
        column_mapping = {
            "REF_DATE": "Date",
            "GEO": "GeoName",
            "Labour force characteristics": "Characteristics",
            "VALUE": "Value"
        }
        df = self.rename_columns(df, column_mapping)
        
        # 过滤行 - 只保留城市数据
        city_list = ["Calgary", "Edmonton", "Vancouver", "Toronto", "Montreal", "Ottawa"]
        filters = {
            "GeoName": city_list,
            "Characteristics": ["Unemployment rate"]
        }
        df = self.filter_rows(df, filters)
        
        # 格式化日期
        df = self.format_date(df, date_col="Date")
        
        # 转换值列
        df = self.transform_value(df, value_col="Value")
        
        # 为每个城市设置GeoID
        geo_id_mapping = {
            "Calgary": "825",
            "Edmonton": "835",
            "Vancouver": "933",
            "Toronto": "535",
            "Montreal": "462",
            "Ottawa": "505"
        }
        df["GeoID"] = df["GeoName"].map(geo_id_mapping)
        
        # 选择列
        columns = ["Date", "GeoID", "GeoName", "Characteristics", "Value"]
        df = self.select_columns(df, columns)
        
        # 转换为字典列表
        result = df.to_dict(orient="records")
        logger.info(f"处理城市数据成功，共 {len(result)} 条记录")
        return result
    
    def process_industry_data(self, file_path: str) -> Optional[List[Dict]]:
        """
        处理行业失业率数据
        
        Args:
            file_path: CSV文件路径
            
        Returns:
            处理后的数据列表，如果处理失败则返回None
        """
        df = self.load_csv(file_path)
        if df is None:
            return None
        
        # 清理列名
        df = self.clean_column_names(df)
        
        # 列映射 - 根据截图中的实际列名调整
        column_mapping = {
            "REF_DATE": "Date",
            "GEO": "GeoName",
            "North American Industry Classification System (NAICS)": "NAICS Description",
            "Labour force characteristics": "Characteristic",
            "VALUE": "Value",
            "Gender": "Sex",
            "Age group": "Age"
        }
        df = self.rename_columns(df, column_mapping)
        
        # 过滤行 - 只保留失业率数据
        filters = {
            "Characteristic": ["Unemployment rate"]
        }
        df = self.filter_rows(df, filters)
        
        # 格式化日期
        df = self.format_date(df, date_col="Date")
        
        # 转换值列
        df = self.transform_value(df, value_col="Value")
        
        # 添加缺失的列
        df["GeoID"] = "2021A000011124"  # 加拿大的GeoID
        df["NAICS"] = ""  # 空NAICS代码
        
        # 选择列
        columns = ["Date", "GeoID", "GeoName", "NAICS Description", "Characteristic", "Sex", "Age", "Value", "NAICS"]
        df = self.select_columns(df, columns)
        
        # 转换为字典列表
        result = df.to_dict(orient="records")
        logger.info(f"处理行业数据成功，共 {len(result)} 条记录")
        return result
    
    def process_occupation_data(self, file_path: str) -> Optional[List[Dict]]:
        """
        处理职业失业率数据
        
        Args:
            file_path: CSV文件路径
            
        Returns:
            处理后的数据列表，如果处理失败则返回None
        """
        df = self.load_csv(file_path)
        if df is None:
            return None
        
        # 清理列名
        df = self.clean_column_names(df)
        
        # 列映射 - 根据截图中的实际列名调整
        column_mapping = {
            "REF_DATE": "Date",
            "GEO": "GeoName",
            "National Occupational Classification (NOC)": "NOC Description",
            "Labour force characteristics": "Characteristics",
            "VALUE": "Value",
            "Sex": "Sex"
        }
        df = self.rename_columns(df, column_mapping)
        
        # 过滤行 - 只保留失业率数据和艾伯塔省数据
        filters = {
            "Characteristics": ["Unemployment rate", "Estimate"],
            "GeoName": ["Alberta", "Canada"]
        }
        df = self.filter_rows(df, filters)
        
        # 格式化日期
        df = self.format_date(df, date_col="Date")
        
        # 转换值列
        df = self.transform_value(df, value_col="Value")
        
        # 提取NOC代码 - 从职业描述中提取
        # 例如: "Total employed, all occupations [00-95]" -> "00-95"
        def extract_noc_code(description):
            if description and isinstance(description, str):
                import re
                # 尝试提取方括号中的内容
                match = re.search(r'\[(.*?)\]', description)
                if match:
                    return match.group(1)
                # 如果没有方括号，尝试提取开头的数字部分
                match = re.search(r'^(\d+(\-\d+)?)', description)
                if match:
                    return match.group(1)
            return ""
            
        df["NOC"] = df["NOC Description"].apply(extract_noc_code)
        
        # 为艾伯塔省设置GeoID
        df["GeoID"] = df["GeoName"].apply(lambda x: "48" if x == "Alberta" else "01")
        
        # 选择列
        columns = ["Date", "GeoID", "GeoName", "Characteristics", "NOC", "NOC Description", "Sex", "Value"]
        df = self.select_columns(df, columns)
        
        # 转换为字典列表
        result = df.to_dict(orient="records")
        logger.info(f"处理职业数据成功，共 {len(result)} 条记录")
        return result
    
    def process_education_data(self, file_path: str) -> Optional[List[Dict]]:
        """
        处理教育程度失业率数据
        
        Args:
            file_path: CSV文件路径
            
        Returns:
            处理后的数据列表，如果处理失败则返回None
        """
        df = self.load_csv(file_path)
        if df is None:
            return None
        
        # 清理列名
        df = self.clean_column_names(df)
        
        # 列映射
        column_mapping = {
            "REF_DATE": "Date",
            "GEO": "GeoName",
            "Labour force characteristics": "Characteristics",
            "Educational attainment": "Education",
            "VALUE": "Value",
            "Sex": "Sex",
            "Age group": "Age"
        }
        df = self.rename_columns(df, column_mapping)
        
        # 过滤行 - 只保留失业率数据
        filters = {
            "Characteristics": ["Unemployment rate"]
        }
        df = self.filter_rows(df, filters)
        
        # 格式化日期
        df = self.format_date(df, date_col="Date")
        
        # 转换值列
        df = self.transform_value(df, value_col="Value")
        
        # 添加GeoID
        df["GeoID"] = "01"  # 加拿大的GeoID
        
        # 选择列
        columns = ["Date", "GeoID", "GeoName", "Characteristics", "Education", "Sex", "Age", "Value"]
        df = self.select_columns(df, columns)
        
        # 转换为字典列表
        result = df.to_dict(orient="records")
        logger.info(f"处理教育程度数据成功，共 {len(result)} 条记录")
        return result
    
    def process_age_data(self, file_path: str) -> Optional[List[Dict]]:
        """
        处理年龄组失业率数据
        
        Args:
            file_path: CSV文件路径
            
        Returns:
            处理后的数据列表，如果处理失败则返回None
        """
        df = self.load_csv(file_path)
        if df is None:
            return None
        
        # 清理列名
        df = self.clean_column_names(df)
        
        # 列映射
        column_mapping = {
            "REF_DATE": "Date",
            "GEO": "GeoName",
            "Labour force characteristics": "Characteristic",
            "VALUE": "Value",
            "Sex": "Sex",
            "Age group": "Age"
        }
        df = self.rename_columns(df, column_mapping)
        
        # 过滤行 - 只保留失业率数据和全国数据
        filters = {
            "Characteristic": ["Unemployment rate"],
            "GeoName": ["Canada"]
        }
        df = self.filter_rows(df, filters)
        
        # 格式化日期
        df = self.format_date(df, date_col="Date")
        
        # 转换值列
        df = self.transform_value(df, value_col="Value")
        
        # 添加GeoID
        df["GeoID"] = "01"  # 加拿大的GeoID
        
        # 选择列
        columns = ["Date", "GeoID", "GeoName", "Characteristic", "Sex", "Age", "Value"]
        df = self.select_columns(df, columns)
        
        # 转换为字典列表
        result = df.to_dict(orient="records")
        logger.info(f"处理年龄组数据成功，共 {len(result)} 条记录")
        return result
    
    def process_sex_data(self, file_path: str) -> Optional[List[Dict]]:
        """
        处理性别失业率数据
        
        Args:
            file_path: CSV文件路径
            
        Returns:
            处理后的数据列表，如果处理失败则返回None
        """
        df = self.load_csv(file_path)
        if df is None:
            return None
        
        # 清理列名
        df = self.clean_column_names(df)
        
        # 列映射
        column_mapping = {
            "REF_DATE": "Date",
            "GEO": "GeoName",
            "Labour force characteristics": "Characteristic",
            "VALUE": "Value",
            "Sex": "Series"
        }
        df = self.rename_columns(df, column_mapping)
        
        # 过滤行 - 只保留失业率数据和全国数据
        filters = {
            "Characteristic": ["Unemployment rate"],
            "GeoName": ["Canada"]
        }
        df = self.filter_rows(df, filters)
        
        # 格式化日期
        df = self.format_date(df, date_col="Date")
        
        # 转换值列
        df = self.transform_value(df, value_col="Value")
        
        # 添加labels列（与Date相同）
        df["labels"] = df["Date"]
        
        # 选择列
        columns = ["Date", "Value", "Series", "labels"]
        df = self.select_columns(df, columns)
        
        # 转换为字典列表
        result = df.to_dict(orient="records")
        logger.info(f"处理性别数据成功，共 {len(result)} 条记录")
        return result
    
    def process_region_data(self, file_path: str) -> Optional[List[Dict]]:
        """
        处理区域失业率数据
        
        Args:
            file_path: CSV文件路径
            
        Returns:
            处理后的数据列表，如果处理失败则返回None
        """
        df = self.load_csv(file_path)
        if df is None:
            return None
        
        # 清理列名
        df = self.clean_column_names(df)
        
        # 列映射
        column_mapping = {
            "REF_DATE": "Date",
            "GEO": "GeoName",
            "Labour force characteristics": "Characteristics",
            "VALUE": "Value"
        }
        df = self.rename_columns(df, column_mapping)
        
        # 过滤行 - 只保留失业率数据和艾伯塔省区域数据
        alberta_regions = ["Calgary", "Edmonton", "Lethbridge-Medicine Hat", "Camrose-Drumheller", "Red Deer", "Northeast"]
        filters = {
            "Characteristics": ["Unemployment rate"],
            "GeoName": alberta_regions
        }
        df = self.filter_rows(df, filters)
        
        # 格式化日期
        df = self.format_date(df, date_col="Date")
        
        # 转换值列
        df = self.transform_value(df, value_col="Value")
        
        # 为每个区域设置GeoID
        geo_id_mapping = {
            "Calgary": 4830,
            "Edmonton": 4835,
            "Lethbridge-Medicine Hat": 4810,
            "Camrose-Drumheller": 4840,
            "Red Deer": 4820,
            "Northeast": 5980
        }
        df["GeoID"] = df["GeoName"].map(geo_id_mapping)
        
        # 选择列
        columns = ["Date", "GeoID", "GeoName", "Characteristics", "Value"]
        df = self.select_columns(df, columns)
        
        # 转换为字典列表
        result = df.to_dict(orient="records")
        logger.info(f"处理区域数据成功，共 {len(result)} 条记录")
        return result
    
    def save_to_json(self, data: List[Dict], filename: str) -> str:
        """
        保存数据为JSON文件，确保没有NaN值（对React友好）
        
        Args:
            data: 数据列表
            filename: 输出文件名
            
        Returns:
            JSON文件的完整路径
        """
        output_path = os.path.join(self.output_dir, filename)
        
        # 自定义JSON编码器，处理NaN和None
        class NpEncoder(json.JSONEncoder):
            def default(self, obj):
                if isinstance(obj, np.integer):
                    return int(obj)
                if isinstance(obj, np.floating):
                    return None if np.isnan(obj) else float(obj)
                if isinstance(obj, np.ndarray):
                    return obj.tolist()
                return super(NpEncoder, self).default(obj)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2, cls=NpEncoder)
        
        logger.info(f"保存JSON文件成功: {output_path}")
        return output_path
    
    def run_etl_pipeline(self, province_file: str, industry_file: str, occupation_file: str) -> Dict[str, str]:
        """
        运行完整的ETL管道
        
        Args:
            province_file: 省份数据CSV文件
            industry_file: 行业数据CSV文件
            occupation_file: 职业数据CSV文件
            
        Returns:
            JSON文件路径字典
        """
        output_files = {}
        
        # 处理省份数据
        province_data = self.process_province_data(province_file)
        if province_data:
            output_files["province"] = self.save_to_json(province_data, "province.json")
        
        # 处理艾伯塔省数据
        alberta_data = self.process_alberta_data(province_file)
        if alberta_data:
            output_files["alberta"] = self.save_to_json(alberta_data, "alberta.json")
        
        # 处理城市数据
        city_data = self.process_city_data(province_file)
        if city_data:
            output_files["city"] = self.save_to_json(city_data, "city.json")
        
        # 处理行业数据
        industry_data = self.process_industry_data(industry_file)
        if industry_data:
            output_files["industry"] = self.save_to_json(industry_data, "industry.json")
        
        # 处理职业数据
        occupation_data = self.process_occupation_data(occupation_file)
        if occupation_data:
            output_files["occupation"] = self.save_to_json(occupation_data, "occupation.json")
        
        # 处理教育程度数据
        education_data = self.process_education_data(province_file)
        if education_data:
            output_files["education"] = self.save_to_json(education_data, "education.json")
        
        # 处理年龄组数据
        age_data = self.process_age_data(province_file)
        if age_data:
            output_files["age"] = self.save_to_json(age_data, "age.json")
        
        # 处理性别数据
        sex_data = self.process_sex_data(province_file)
        if sex_data:
            output_files["sex"] = self.save_to_json(sex_data, "sex.json")
        
        # 处理区域数据
        region_data = self.process_region_data(province_file)
        if region_data:
            output_files["region"] = self.save_to_json(region_data, "region.json")
        
        return output_files


def main():
    # 创建ETL处理器，使用相对路径
    etl = UnemploymentDataETL(
        input_dir="../canada_unemployment_data", 
        output_dir="../public/data"
    )
    
    # 运行ETL管道
    output_files = etl.run_etl_pipeline(
        province_file="14100287.csv",  # 省份数据
        industry_file="14100023.csv",  # 行业数据
        occupation_file="14100310.csv" # 职业数据
    )
    
    # 打印输出文件路径
    logger.info(f"ETL处理完成，共生成 {len(output_files)} 个JSON文件")
    for file_type, file_path in output_files.items():
        logger.info(f"- {file_type}: {file_path}")


if __name__ == "__main__":
    main()