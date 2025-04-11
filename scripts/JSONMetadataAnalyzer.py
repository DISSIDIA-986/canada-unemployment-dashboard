#!/usr/bin/env python3
"""
生成所有JSON文件的详细元数据分析报告。
分析包括：文件结构、字段名称、字段类型、唯一值分布等信息。
支持处理嵌套JSON结构。

使用方法:
python analyze_json_metadata.py [--data_dir 数据目录] [--output_file 输出文件]
"""

import os
import json
import sys
import pandas as pd
import numpy as np
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List, Any, Set, Tuple, Union
import datetime


class JSONMetadataAnalyzer:
    """JSON元数据分析器，用于提取和分析JSON文件的元数据"""

    def __init__(self, data_dir: str = "public/data", output_file: str = "json_metadata_report.md"):
        """
        初始化分析器

        Args:
            data_dir: 包含JSON文件的目录路径
            output_file: 输出报告的文件路径
        """
        # 获取项目根目录
        self.project_root = Path(__file__).parent.parent  # 假设脚本在项目的scripts目录中
        self.data_path = self.project_root / data_dir
        self.output_path = self.project_root / output_file

        # 配置参数
        self.unique_value_threshold = 30  # 唯一值显示阈值
        self.sample_size = 5  # 样本元素数量
        self.max_nested_level = 5  # 嵌套层级限制

        # 结果存储
        self.results = {}

    def analyze_all_files(self):
        """分析所有JSON文件并生成报告"""
        # 确保数据目录存在
        if not self.data_path.exists() or not self.data_path.is_dir():
            print(f"错误: 目录 '{self.data_path}' 不存在")
            sys.exit(1)

        # 查找所有JSON文件
        json_files = [f for f in self.data_path.glob("*.json")]

        if not json_files:
            print(f"在 '{self.data_path}' 中未找到JSON文件")
            sys.exit(0)

        # 分析每个文件
        for json_file in sorted(json_files):
            print(f"正在分析 {json_file.name}...")
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                self.results[json_file.name] = self.analyze_json_data(data, json_file.name)
            except Exception as e:
                print(f"处理文件 {json_file.name} 时出错: {e}")
                self.results[json_file.name] = {"error": str(e)}

        # 生成报告
        self.generate_report()

    def analyze_json_data(self, data: Any, filename: str) -> Dict:
        """
        分析JSON数据的结构和内容

        Args:
            data: JSON数据对象
            filename: 文件名，用于记录

        Returns:
            包含分析结果的字典
        """
        result = {
            "filename": filename,
            "analysis_time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        # 确定数据类型和结构
        if isinstance(data, list):
            result["data_type"] = "array"
            result["element_count"] = len(data)

            # 检查是否为空数组
            if len(data) == 0:
                result["is_empty"] = True
                return result

            result["is_empty"] = False

            # 分析数组中的元素
            sample_elements = data[:min(self.sample_size, len(data))]
            result["sample_elements"] = sample_elements

            # 分析数组元素的结构
            element_structure_info = self.analyze_element_structure(data)
            result.update(element_structure_info)

        elif isinstance(data, dict):
            result["data_type"] = "object"
            result["key_count"] = len(data)

            # 提取字段信息
            result["fields"] = self.analyze_object_fields(data)

            # 检查嵌套数组
            nested_arrays = {}
            for key, value in data.items():
                if isinstance(value, list):
                    nested_arrays[key] = self.analyze_json_data(value, f"{filename}.{key}")

            if nested_arrays:
                result["nested_arrays"] = nested_arrays

        else:
            result["data_type"] = type(data).__name__
            result["value"] = data

        return result

    def analyze_element_structure(self, array_data: List) -> Dict:
        """
        分析数组元素的结构

        Args:
            array_data: 数组数据

        Returns:
            包含元素结构分析结果的字典
        """
        result = {}

        # 检查数组元素的类型
        element_types = [type(item).__name__ for item in array_data]
        element_type_counts = Counter(element_types)
        result["element_types"] = dict(element_type_counts)

        # 如果所有元素都是字典，提取并分析字段
        if all(isinstance(item, dict) for item in array_data):
            # 收集所有可能的字段名称
            all_fields = set()
            for item in array_data:
                all_fields.update(item.keys())

            # 分析每个字段
            field_analysis = {}
            for field in all_fields:
                # 提取字段值
                field_values = [item.get(field) for item in array_data if field in item]

                # 计算字段存在率
                presence_rate = len(field_values) / len(array_data) * 100

                # 分析字段值
                field_analysis[field] = self.analyze_field_values(field_values, presence_rate)

            result["fields"] = field_analysis

        return result

    def analyze_object_fields(self, obj_data: Dict) -> Dict:
        """
        分析对象字段

        Args:
            obj_data: 对象数据

        Returns:
            包含字段分析结果的字典
        """
        field_analysis = {}

        for field, value in obj_data.items():
            # 如果值是数组，提供数组大小信息和示例元素
            if isinstance(value, list):
                element_info = {
                    "type": "array",
                    "element_count": len(value),
                    "element_types": Counter([type(item).__name__ for item in value]),
                }

                # 如果是非空数组，提供示例元素
                if len(value) > 0:
                    if len(value) <= self.sample_size:
                        element_info["elements"] = value
                    else:
                        element_info["sample_elements"] = value[:self.sample_size]

                    # 如果元素是字典，递归分析
                    if all(isinstance(item, dict) for item in value[:self.sample_size]):
                        element_fields = set()
                        for item in value[:self.sample_size]:
                            element_fields.update(item.keys())

                        field_presence = {}
                        for element_field in element_fields:
                            count = sum(1 for item in value[:self.sample_size] if element_field in item)
                            field_presence[element_field] = count

                        element_info["element_fields"] = field_presence

                field_analysis[field] = element_info

            # 如果值是对象，递归分析
            elif isinstance(value, dict):
                field_analysis[field] = {
                    "type": "object",
                    "key_count": len(value),
                    "fields": self.analyze_object_fields(value)
                }

            # 如果是基本类型，直接分析值
            else:
                field_analysis[field] = {
                    "type": type(value).__name__,
                    "value": value
                }

        return field_analysis

    def analyze_field_values(self, values: List, presence_rate: float) -> Dict:
        """
        分析字段值

        Args:
            values: 字段值列表
            presence_rate: 字段存在率

        Returns:
            包含字段值分析结果的字典
        """
        result = {
            "count": len(values),
            "presence_rate": presence_rate
        }

        # 过滤掉None值进行分析
        non_null_values = [v for v in values if v is not None]
        result["non_null_count"] = len(non_null_values)

        if len(non_null_values) == 0:
            result["type"] = "unknown (all null)"
            return result

        # 确定字段值类型
        value_types = [type(v).__name__ for v in non_null_values]
        type_counter = Counter(value_types)
        result["value_types"] = dict(type_counter)

        # 确定主要类型
        main_type = type_counter.most_common(1)[0][0]
        result["main_type"] = main_type

        # 根据主要类型进行不同的分析
        if main_type in ['int', 'float']:
            numeric_values = [float(v) for v in non_null_values if isinstance(v, (int, float))]
            result.update({
                "min": min(numeric_values) if numeric_values else None,
                "max": max(numeric_values) if numeric_values else None,
                "mean": sum(numeric_values) / len(numeric_values) if numeric_values else None,
                "median": self._calculate_median(numeric_values)
            })

        # 分析唯一值
        unique_values = set(str(v) for v in non_null_values)
        result["unique_value_count"] = len(unique_values)

        # 如果唯一值数量不多，列出所有唯一值
        if len(unique_values) <= self.unique_value_threshold:
            # 对于字符串值，提供值计数
            if main_type == 'str':
                value_counts = Counter([str(v) for v in non_null_values])
                result["value_distribution"] = dict(value_counts.most_common())
            else:
                result["unique_values"] = list(unique_values)

        return result

    def _calculate_median(self, values: List[float]) -> float:
        """计算中位数"""
        if not values:
            return None

        sorted_values = sorted(values)
        n = len(sorted_values)

        if n % 2 == 0:
            return (sorted_values[n // 2 - 1] + sorted_values[n // 2]) / 2
        else:
            return sorted_values[n // 2]

    def generate_report(self):
        """生成元数据分析报告"""
        # 创建Markdown报告
        md_content = "# JSON文件元数据分析报告\n\n"
        md_content += f"**生成时间**: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        md_content += f"**分析的文件目录**: `{self.data_path}`\n\n"
        md_content += f"**分析的文件数量**: {len(self.results)}\n\n"

        # 添加一个目录
        md_content += "## 目录\n\n"
        for filename in self.results.keys():
            file_anchor = filename.replace('.', '_')
            md_content += f"- [{filename}](#{file_anchor})\n"

        md_content += "\n## 详细分析\n\n"

        # 为每个文件添加详细分析
        for filename, result in self.results.items():
            file_anchor = filename.replace('.', '_')
            md_content += f"<a id='{file_anchor}'></a>\n"
            md_content += f"### {filename}\n\n"

            if "error" in result:
                md_content += f"**分析错误**: {result['error']}\n\n"
                continue

            md_content += f"**数据类型**: {result['data_type']}\n\n"

            if result['data_type'] == 'array':
                md_content += f"**元素数量**: {result['element_count']}\n\n"

                if result.get('is_empty', False):
                    md_content += "**空数组**\n\n"
                    continue

                # 输出元素类型分布
                md_content += "**元素类型分布**:\n\n"
                for type_name, count in result.get('element_types', {}).items():
                    md_content += f"- {type_name}: {count} ({(count / result['element_count']) * 100:.1f}%)\n"
                md_content += "\n"

                # 如果有字段分析，输出字段信息
                if 'fields' in result:
                    md_content += "**字段分析**:\n\n"
                    md_content += self._format_fields_table(result['fields'])

                    # 为每个字段添加详细描述
                    md_content += "\n**字段详细信息**:\n\n"
                    for field, field_info in result['fields'].items():
                        md_content += self._format_field_details(field, field_info)

            elif result['data_type'] == 'object':
                md_content += f"**键的数量**: {result['key_count']}\n\n"

                if 'fields' in result:
                    md_content += "**字段分析**:\n\n"
                    md_content += self._format_object_fields(result['fields'])

                # 如果有嵌套数组，输出每个嵌套数组的简要信息
                if 'nested_arrays' in result:
                    md_content += "**嵌套数组**:\n\n"
                    for array_key, array_info in result['nested_arrays'].items():
                        md_content += f"- **{array_key}**: {array_info.get('element_count', 0)} 个元素\n"

                    # 为每个嵌套数组添加详细信息
                    md_content += "\n**嵌套数组详细信息**:\n\n"
                    for array_key, array_info in result['nested_arrays'].items():
                        md_content += f"#### 嵌套数组: {array_key}\n\n"

                        if "fields" in array_info:
                            md_content += "**字段分析**:\n\n"
                            md_content += self._format_fields_table(array_info['fields'])

                            # 为每个字段添加详细描述
                            md_content += "\n**字段详细信息**:\n\n"
                            for field, field_info in array_info['fields'].items():
                                md_content += self._format_field_details(field, field_info)

            md_content += "\n---\n\n"

        # 写入报告文件
        with open(self.output_path, 'w', encoding='utf-8') as f:
            f.write(md_content)

        print(f"元数据报告已成功写入 {self.output_path}")

    def _format_fields_table(self, fields: Dict) -> str:
        """格式化字段分析表格"""
        md_table = "| 字段名 | 类型 | 值数量 | 非空率 | 唯一值数量 | 备注 |\n"
        md_table += "|-------|------|--------|-------|------------|------|\n"

        for field, info in fields.items():
            field_type = info.get('main_type', 'unknown')
            count = info.get('count', 0)
            non_null_count = info.get('non_null_count', 0)
            non_null_rate = (non_null_count / count) * 100 if count > 0 else 0
            unique_count = info.get('unique_value_count', 0)

            notes = []
            if 'min' in info and 'max' in info:
                notes.append(f"范围: {info['min']} - {info['max']}")
            if unique_count <= self.unique_value_threshold and 'value_distribution' in info:
                top_values = ", ".join([f"{k}({v})" for k, v in list(info['value_distribution'].items())[:3]])
                if len(info['value_distribution']) > 3:
                    top_values += "..."
                notes.append(f"常见值: {top_values}")

            md_table += f"| {field} | {field_type} | {count} | {non_null_rate:.1f}% | {unique_count} | {'; '.join(notes)} |\n"

        return md_table

    def _format_field_details(self, field: str, info: Dict) -> str:
        """格式化字段详细信息"""
        md_content = f"#### 字段: {field}\n\n"
        md_content += f"- **类型**: {info.get('main_type', 'unknown')}\n"
        md_content += f"- **出现次数**: {info.get('count', 0)}\n"
        md_content += f"- **非空值数量**: {info.get('non_null_count', 0)}\n"
        md_content += f"- **存在率**: {info.get('presence_rate', 0):.1f}%\n"
        md_content += f"- **唯一值数量**: {info.get('unique_value_count', 0)}\n"

        # 如果是数值类型，添加统计信息
        if 'min' in info and 'max' in info:
            md_content += f"- **最小值**: {info['min']}\n"
            md_content += f"- **最大值**: {info['max']}\n"
            md_content += f"- **平均值**: {info['mean']:.2f}\n"
            md_content += f"- **中位数**: {info['median']}\n"

        # 如果唯一值不多，显示值分布
        if info.get('unique_value_count', 0) <= self.unique_value_threshold:
            md_content += "\n**值分布**:\n\n"

            if 'value_distribution' in info:
                md_content += "| 值 | 频次 | 占比 |\n"
                md_content += "|---|------|------|\n"

                total = sum(info['value_distribution'].values())
                for value, count in info['value_distribution'].items():
                    percentage = (count / total) * 100
                    md_content += f"| {value} | {count} | {percentage:.1f}% |\n"
            elif 'unique_values' in info:
                md_content += ", ".join([str(v) for v in info['unique_values']])
                md_content += "\n"

        md_content += "\n"
        return md_content

    def _format_object_fields(self, fields: Dict) -> str:
        """格式化对象字段信息"""
        md_table = "| 字段名 | 类型 | 详情 |\n"
        md_table += "|-------|------|------|\n"

        for field, info in fields.items():
            field_type = info.get('type', 'unknown')
            details = ""

            if field_type == 'array':
                element_count = info.get('element_count', 0)
                details = f"{element_count} 个元素"

                # 添加元素类型信息
                if 'element_types' in info:
                    type_info = ", ".join([f"{t}: {c}" for t, c in info['element_types'].items()])
                    details += f"; 元素类型: {type_info}"

                # 添加字段信息
                if 'element_fields' in info:
                    field_info = ", ".join([f"{f}: {c}" for f, c in info['element_fields'].items()])
                    details += f"; 字段: {field_info}"

            elif field_type == 'object':
                key_count = info.get('key_count', 0)
                details = f"{key_count} 个键"

            else:
                details = f"值: {info.get('value', '')}"

            md_table += f"| {field} | {field_type} | {details} |\n"

        return md_table


def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="分析JSON文件元数据并生成报告")
    parser.add_argument("--data_dir", default="public/data", help="包含JSON文件的目录路径")
    parser.add_argument("--output_file", default="/tmp/json_metadata_report.md", help="输出报告的文件路径")

    args = parser.parse_args()

    analyzer = JSONMetadataAnalyzer(args.data_dir, args.output_file)
    analyzer.analyze_all_files()


if __name__ == "__main__":
    main()