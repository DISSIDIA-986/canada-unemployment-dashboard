#!/usr/bin/env python3
"""
Generate a summary of all JSON files in the public/data directory.
Extracts the first element from each JSON array and outputs a Markdown summary.
"""

import os
import json
import sys
from pathlib import Path

def generate_json_summary(data_dir="public/data", output_file="data_summary.md"):
    """
    Generate a summary of all JSON files in the specified directory.
    
    Args:
        data_dir (str): Path to the directory containing JSON files
        output_file (str): Path to the output Markdown file
    """
    # Get the project root directory
    project_root = Path(__file__).parent.parent
    data_path = project_root / data_dir
    output_path = project_root / output_file
    
    # Ensure data directory exists
    if not data_path.exists() or not data_path.is_dir():
        print(f"Error: Directory '{data_path}' does not exist")
        sys.exit(1)
    
    # Find all JSON files
    json_files = [f for f in data_path.glob("*.json")]
    
    if not json_files:
        print(f"No JSON files found in '{data_path}'")
        sys.exit(0)
    
    # Create markdown content
    md_content = "# JSON Data Summary\n\n"
    md_content += "This document provides a summary of the JSON data files used by the Alberta Dashboard application.\n"
    md_content += "Each section shows the filename and the first element of the data array to provide insight into the data structure.\n\n"
    
    # Process each JSON file
    for json_file in sorted(json_files):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            md_content += f"## {json_file.name}\n\n"
            
            if isinstance(data, list) and len(data) > 0:
                sample = data[0]
                md_content += f"Array with {len(data)} elements. First element sample:\n\n"
            else:
                sample = data
                md_content += "Data structure:\n\n"
            
            # Format JSON with indentation for readability
            formatted_json = json.dumps(sample, indent=2)
            md_content += f"```json\n{formatted_json}\n```\n\n"
            
            # Add a line about the fields available
            if isinstance(sample, dict):
                fields = sorted(sample.keys())
                md_content += "**Available fields:** " + ", ".join(f"`{field}`" for field in fields) + "\n\n"
            
        except Exception as e:
            md_content += f"Error processing file: {e}\n\n"
    
    # Write the markdown content to the output file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
    
    print(f"Summary successfully written to {output_path}")

if __name__ == "__main__":
    generate_json_summary()
