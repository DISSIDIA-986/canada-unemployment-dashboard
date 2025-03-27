import requests
import pandas as pd
import os
import zipfile
import io
import logging
from typing import List, Dict, Optional, Tuple

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('statcan_downloader')

class StatCanDownloader:
    """加拿大统计局数据下载器"""
    
    BASE_URL = "https://www150.statcan.gc.ca/n1/tbl/csv"
    API_BASE_URL = "https://www150.statcan.gc.ca/t1/wds/rest"
    
    # 常用数据集字典
    DATASET_DICT = {
        "province_monthly": "14100287",  # 按省份分类的劳动力特征数据（月度，季节性调整）
        "industry_annual": "14100023",   # 按行业分类的劳动力特征数据（年度）
        "occupation_monthly": "14100310", # 按职业分类的就业数据（月度，季节性调整）
        "rates_general": "1410002001",   # 失业率、参与率和就业率数据
        "province_unadjusted": "1410028703", # 按省份分类的劳动力特征数据（月度，未调整）
        "wages_occupation": "1410041701", # 按职业分类的员工薪酬数据（年度）
        "job_vacancies": "1410032501"    # 职位空缺、薪资员工、职位空缺率和平均提供工资数据
    }
    
    def __init__(self, output_dir: str = "statcan_data"):
        """
        初始化下载器
        
        Args:
            output_dir: 输出目录
        """
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        logger.info(f"初始化下载器，输出目录: {output_dir}")
    
    def download_dataset(self, product_id: str, file_format: str = "zip") -> Optional[str]:
        """
        下载特定产品ID的数据集
        
        Args:
            product_id: 数据产品ID
            file_format: 文件格式（默认：zip）
            
        Returns:
            下载的文件路径，如果下载失败则返回None
        """
        url = f"{self.BASE_URL}/{product_id}-eng.{file_format}"
        logger.info(f"开始下载数据集 {product_id}, URL: {url}")
        
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            file_path = os.path.join(self.output_dir, f"{product_id}.{file_format}")
            with open(file_path, 'wb') as file:
                file.write(response.content)
            
            logger.info(f"数据集下载成功: {file_path}")
            
            # 如果是zip文件，解压
            if file_format == "zip":
                extracted_files = self._extract_zip(file_path)
                os.remove(file_path)  # 删除zip文件
                return extracted_files[0] if extracted_files else None
            
            return file_path
        
        except requests.exceptions.RequestException as e:
            logger.error(f"下载失败: {e}")
            return None
    
    def _extract_zip(self, zip_path: str) -> List[str]:
        """
        解压ZIP文件
        
        Args:
            zip_path: ZIP文件路径
            
        Returns:
            解压后的文件列表
        """
        extracted_files = []
        
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                for file_info in zip_ref.infolist():
                    file_name = os.path.basename(file_info.filename)
                    if file_name:  # 跳过目录
                        extract_path = os.path.join(self.output_dir, file_name)
                        with zip_ref.open(file_info) as source, open(extract_path, 'wb') as target:
                            target.write(source.read())
                        extracted_files.append(extract_path)
            
            logger.info(f"已成功解压 {zip_path}，共 {len(extracted_files)} 个文件")
            return extracted_files
        
        except zipfile.BadZipFile as e:
            logger.error(f"解压失败: {e}")
            return []
    
    def search_datasets(self, keyword: str, max_results: int = 20) -> List[Dict]:
        """
        搜索与关键词相关的数据集
        
        Args:
            keyword: 搜索关键词
            max_results: 最大结果数
            
        Returns:
            数据集列表
        """
        url = f"{self.API_BASE_URL}/search"
        params = {
            "keyword": keyword,
            "limit": max_results
        }
        
        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            datasets = response.json()
            
            logger.info(f"搜索 '{keyword}' 返回 {len(datasets)} 个结果")
            return datasets
        
        except requests.exceptions.RequestException as e:
            logger.error(f"搜索请求失败: {e}")
            return []
    
    def get_dataset_by_category(self, category: str) -> Optional[str]:
        """
        根据预定义的类别获取数据集
        
        Args:
            category: 数据集类别
            
        Returns:
            数据集产品ID，如果类别不存在则返回None
        """
        if category in self.DATASET_DICT:
            return self.DATASET_DICT[category]
        
        logger.warning(f"未找到类别 '{category}'，使用默认数据集")
        return None
    
    def merge_csv_files(self, file_list: List[str], output_file: str) -> Optional[str]:
        """
        合并多个CSV文件
        
        Args:
            file_list: 文件路径列表
            output_file: 输出文件名
            
        Returns:
            合并后的文件路径，如果合并失败则返回None
        """
        if not file_list:
            logger.warning("没有文件可合并")
            return None
        
        try:
            dfs = []
            for file in file_list:
                logger.info(f"读取文件: {file}")
                df = pd.read_csv(file, encoding='utf-8', low_memory=False)
                dfs.append(df)
            
            merged_df = pd.concat(dfs, ignore_index=True)
            output_path = os.path.join(self.output_dir, output_file)
            merged_df.to_csv(output_path, index=False, encoding='utf-8')
            
            logger.info(f"已成功合并 {len(file_list)} 个文件: {output_path}")
            return output_path
        
        except Exception as e:
            logger.error(f"合并文件失败: {e}")
            return None
    
    def process_data(self, file_path: str, filters: Dict = None, 
                     selected_columns: List[str] = None) -> pd.DataFrame:
        """
        处理数据，包括过滤和选择列
        
        Args:
            file_path: CSV文件路径
            filters: 过滤条件，格式为 {列名: 值}
            selected_columns: 要选择的列名列表
            
        Returns:
            处理后的DataFrame
        """
        try:
            df = pd.read_csv(file_path, encoding='utf-8', low_memory=False)
            logger.info(f"原始数据形状: {df.shape}")
            
            # 应用过滤器
            if filters:
                for col, val in filters.items():
                    if col in df.columns:
                        if isinstance(val, list):
                            df = df[df[col].isin(val)]
                        else:
                            df = df[df[col] == val]
                
                logger.info(f"过滤后数据形状: {df.shape}")
            
            # 选择特定列
            if selected_columns:
                available_columns = [col for col in selected_columns if col in df.columns]
                if available_columns:
                    df = df[available_columns]
                    logger.info(f"选择列后数据形状: {df.shape}")
                else:
                    logger.warning("未找到任何指定的列")
            
            return df
        
        except Exception as e:
            logger.error(f"处理数据失败: {e}")
            return pd.DataFrame()
    
    def download_multiple_datasets(self, categories: List[str]) -> Tuple[List[str], Dict[str, str]]:
        """
        下载多个数据集
        
        Args:
            categories: 数据集类别列表
            
        Returns:
            (下载的文件路径列表, 类别到文件路径的映射)
        """
        downloaded_files = []
        category_file_map = {}
        
        for category in categories:
            product_id = self.get_dataset_by_category(category)
            if product_id:
                file_path = self.download_dataset(product_id)
                if file_path:
                    downloaded_files.append(file_path)
                    category_file_map[category] = file_path
                    logger.info(f"已下载类别 '{category}' 对应的数据集: {file_path}")
                else:
                    logger.error(f"下载类别 '{category}' 对应的数据集失败")
            else:
                logger.warning(f"未找到类别 '{category}' 对应的数据集")
        
        return downloaded_files, category_file_map


def main():
    # 创建下载器
    downloader = StatCanDownloader(output_dir="canada_unemployment_data")
    
    # 要下载的数据集类别
    categories = [
        "province_monthly",  # 按省份分类的劳动力特征数据（月度，季节性调整）
        "industry_annual",   # 按行业分类的劳动力特征数据（年度）
        "occupation_monthly" # 按职业分类的就业数据（月度，季节性调整）
    ]
    
    # 下载多个数据集
    downloaded_files, category_file_map = downloader.download_multiple_datasets(categories)
    
    # 合并数据
    if downloaded_files:
        merged_file = downloader.merge_csv_files(
            downloaded_files, 
            "merged_labour_force_data.csv"
        )
        if merged_file:
            logger.info(f"所有数据已合并到: {merged_file}")
        
        # 可选: 处理特定数据集
        if "province_monthly" in category_file_map:
            province_file = category_file_map["province_monthly"]
            # 示例: 过滤特定省份和失业相关数据
            filters = {
                "GEO": ["Alberta", "Ontario", "British Columbia"],
                "Labour force characteristics": ["Unemployment rate"]
            }
            selected_columns = ["REF_DATE", "GEO", "Labour force characteristics", "VALUE"]
            
            province_df = downloader.process_data(
                province_file, 
                filters=filters,
                selected_columns=selected_columns
            )
            
            # 保存处理后的数据
            processed_file = os.path.join(
                downloader.output_dir, 
                "processed_province_unemployment.csv"
            )
            province_df.to_csv(processed_file, index=False)
            logger.info(f"处理后的省级失业率数据已保存到: {processed_file}")
    else:
        logger.error("所有下载都失败了，无法合并数据")


if __name__ == "__main__":
    main()
