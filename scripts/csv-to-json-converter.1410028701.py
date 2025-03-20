import os
import pandas as pd
import numpy as np
import json
import re
import glob
import csv
from datetime import datetime

def process_csv_files(directory_path):
    """
    Process all the CSV files in the given directory to extract unemployment data
    """
    # Get all CSV files in the directory
    csv_files = glob.glob(os.path.join(directory_path, "*.csv"))
    print(f"Found {len(csv_files)} CSV files")
    
    all_data = []
    
    for file_path in csv_files:
        print(f"Processing file: {file_path}")
        
        try:
            # Read the raw file
            with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                lines = f.readlines()
            
            # Extract metadata from the file
            gender = "Both sexes"
            age_group = "All ages"
            geo_name = "Canada"
            
            # First try to find gender from row 10, column C (as seen in the Excel screenshot)
            # Also try to find age group from row 11, column C
            age_found = False
            gender_found = False
            
            for i, line in enumerate(lines):
                if i == 9:  # 10th row (0-indexed) - Gender
                    parts = line.strip().split(',')
                    if len(parts) > 2:
                        gender_cell = parts[2].strip().replace('"', '')
                        if "Men+" in gender_cell:
                            gender = "Male"
                            gender_found = True
                            print(f"Found gender in row 10: {gender}")
                        elif "Women+" in gender_cell:
                            gender = "Female"
                            gender_found = True
                            print(f"Found gender in row 10: {gender}")
                
                if i == 10:  # 11th row (0-indexed) - Age group
                    parts = line.strip().split(',')
                    if len(parts) > 2:
                        age_cell = parts[2].strip().replace('"', '')
                        if "years" in age_cell:
                            age_group = age_cell
                            age_found = True
                            print(f"Found age group in row 11: {age_group}")
                
                if age_found and gender_found:
                    break
            
            # If not found, try alternative methods
            if gender == "Both sexes":
                for line in lines[:12]:
                    if "Gender" in line and ":" in line:
                        parts = line.split(":")
                        if len(parts) > 1:
                            gender_value = parts[1].strip().split(',')[0].strip()
                            if gender_value:
                                if "Men" in gender_value:
                                    gender = "Male"
                                elif "Women" in gender_value:
                                    gender = "Female"
                                else:
                                    gender = gender_value
                                print(f"Found gender from metadata: {gender}")
            
            for line in lines[:12]:
                if "Age group" in line and ":" in line:
                    parts = line.split(":")
                    if len(parts) > 1:
                        age_value = parts[1].strip().split(',')[0].strip()
                        if age_value:
                            age_group = age_value
            
            print(f"Metadata - Gender: {gender}, Age: {age_group}, Geography: {geo_name}")
            
            # Find header row with dates and unemployment rate row
            date_row = None
            unemployment_row = None
            
            for i, line in enumerate(lines):
                # Check for date header row (contains months and years)
                if "January" in line and "February" in line and "March" in line:
                    date_row = i
                    print(f"Found date row at line {i+1}")
                
                # Check for unemployment rate row
                if "Unemployment rate" in line:
                    unemployment_row = i
                    print(f"Found unemployment rate row at line {i+1}")
            
            if date_row is None or unemployment_row is None:
                print(f"Could not find required rows in {file_path}")
                continue
            
            # Parse the date row to extract dates
            date_parts = lines[date_row].strip().split(',')
            
            # Identify where the date data actually starts (skip headers)
            start_idx = 0
            for i, part in enumerate(date_parts):
                if "January" in part or "February" in part or "March" in part:
                    start_idx = i
                    break
            
            dates = []
            for i in range(start_idx, len(date_parts)):
                date_str = date_parts[i].strip().replace('"', '')
                
                if date_str and date_str != '..':
                    # Parse date in format like "January 2001"
                    match = re.search(r'([A-Za-z]+)\s+(\d{4})', date_str)
                    if match:
                        month_name, year = match.groups()
                        month_map = {
                            'January': '01', 'February': '02', 'March': '03', 'April': '04',
                            'May': '05', 'June': '06', 'July': '07', 'August': '08',
                            'September': '09', 'October': '10', 'November': '11', 'December': '12'
                        }
                        month = month_map.get(month_name, '01')
                        date = f"{year}-{month}-01"
                        dates.append(date)
                    else:
                        dates.append(None)
                else:
                    dates.append(None)
            
            # Parse unemployment rate row
            unemployment_parts = lines[unemployment_row].strip().split(',')
            
            # Skip header columns to align with dates
            data_count = 0
            
            for i, date in enumerate(dates):
                if date is not None and start_idx + i < len(unemployment_parts):
                    value_str = unemployment_parts[start_idx + i].strip().replace('"', '')
                    
                    if value_str and value_str != '..' and value_str != 'F':
                        try:
                            value = float(value_str)
                            
                            # Create data point
                            data_point = {
                                "Date": date + "T00:00:00",
                                "GeoID": "01",  # Default GeoID for Canada
                                "GeoName": geo_name,
                                "Characteristic": "Unemployment rate",
                                "Sex": gender,
                                "Age": age_group,
                                "Value": value
                            }
                            all_data.append(data_point)
                            data_count += 1
                        except ValueError as e:
                            print(f"Could not convert '{value_str}' to float: {str(e)}")
            
            print(f"Extracted {data_count} data points from {file_path}")
            
        except Exception as e:
            print(f"Error processing file {file_path}: {str(e)}")
    
    print(f"Total data points collected: {len(all_data)}")
    return all_data

def create_age_json(data, output_file):
    """
    Create the age.json file from the processed data
    """
    # Filter out any incomplete data points
    valid_data = [item for item in data if all(k in item for k in ["Date", "GeoID", "GeoName", "Characteristic", "Sex", "Age", "Value"])]
    
    # Write to JSON file
    with open(output_file, 'w') as f:
        json.dump(valid_data, f, indent=2)
    
    print(f"Created {output_file} with {len(valid_data)} records")

def create_sex_json(data, output_file):
    """
    Create the sex.json file from the processed data
    """
    sex_data = []
    
    # Filter to just Male and Female data points
    gender_data = [item for item in data if item["Sex"] in ["Male", "Female"]]
    
    if not gender_data:
        print("WARNING: No Male or Female data points found. Check gender extraction in the script.")
    
    for item in gender_data:
        if all(k in item for k in ["Date", "Sex", "Value"]):
            sex_data.append({
                "Date": item["Date"].split("T")[0],
                "Value": item["Value"],
                "Series": item["Sex"],
                "labels": item["Date"]
            })
    
    # Write to JSON file
    with open(output_file, 'w') as f:
        json.dump(sex_data, f, indent=2)
    
    print(f"Created {output_file} with {len(sex_data)} records")
    
    # Print a summary of the data by gender
    male_count = len([item for item in sex_data if item["Series"] == "Male"])
    female_count = len([item for item in sex_data if item["Series"] == "Female"])
    print(f"Sex data summary: Male: {male_count}, Female: {female_count}")

def main():
    # Directory path containing the CSV files
    directory_path = "/private/tmp/1410028701"
    
    # Process CSV files
    data = process_csv_files(directory_path)
    
    # Create output directory if it doesn't exist
    output_dir = os.path.join(directory_path, "output")
    os.makedirs(output_dir, exist_ok=True)
    
    # Create JSON files
    create_age_json(data, os.path.join(output_dir, "age.json"))
    create_sex_json(data, os.path.join(output_dir, "sex.json"))
    
    print("Data processing completed successfully")

if __name__ == "__main__":
    main()
