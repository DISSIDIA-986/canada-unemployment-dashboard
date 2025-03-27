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
    
    def merge_csv_files(self, file_list: List[str], output_file: str) -> Optional[str]:
        """
        合并多个CSV文件，确保列名和数据类型一致
        
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
                
                # 统一列名（例如，将日期列统一为 "REF_DATE"）
                if "Date" in df.columns:
                    df.rename(columns={"Date": "REF_DATE"}, inplace=True)
                
                # 清洗数据
                if "REF_DATE" in df.columns:
                    df["REF_DATE"] = pd.to_datetime(df["REF_DATE"], errors='coerce')
                if "VALUE" in df.columns:
                    df["VALUE"] = pd.to_numeric(df["VALUE"], errors='coerce')
                
                dfs.append(df)
                logger.info(f"文件 {file} 已加载，形状: {df.shape}")
            
            # 合并数据（使用 outer join 保留所有列）
            merged_df = pd.concat(dfs, axis=0, ignore_index=True, join='outer')
            output_path = os.path.join(self.output_dir, output_file)
            merged_df.to_csv(output_path, index=False, encoding='utf-8')
            
            logger.info(f"已成功合并 {len(file_list)} 个文件: {output_path}")
            return output_path
        
        except Exception as e:
            logger.error(f"合并文件失败: {e}")
            return None
    
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
    else:
        logger.error("所有下载都失败了，无法合并数据")


if __name__ == "__main__":
    main()
