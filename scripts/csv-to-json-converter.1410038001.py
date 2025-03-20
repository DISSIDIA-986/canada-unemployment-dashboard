import os
import pandas as pd
import json
import re
import glob
from datetime import datetime

def process_city_csv_files(directory_path):
    """
    Process CSV files containing census metropolitan area unemployment data
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
            
            # Find header row with dates and location data
            date_row = None
            data_start_row = None
            
            for i, line in enumerate(lines):
                # Look for the header row with months and years
                if ("Jan-" in line or "Feb-" in line or "Mar-" in line or 
                    "January" in line or "February" in line or "March" in line):
                    date_row = i
                    print(f"Found date row at line {i+1}")
                
                # Look for the row with "Canada" as first entry (start of data)
                if line.strip().startswith('"Canada"') or line.strip().startswith('Canada,'):
                    data_start_row = i
                    print(f"Found data start row at line {i+1}")
                    break
            
            if date_row is None or data_start_row is None:
                # Try again with different patterns
                for i, line in enumerate(lines):
                    if any(month in line for month in ["Jan-", "Feb-", "Mar-", "Apr-", "May-", "Jun-"]):
                        date_row = i
                        print(f"Found date row at line {i+1} (alternative method)")
                    
                    if "Canada" in line and (i > 10) and ("," in line or "\t" in line):
                        data_start_row = i
                        print(f"Found data start row at line {i+1} (alternative method)")
                        break
            
            if date_row is None or data_start_row is None:
                print(f"Could not find required rows in {file_path}")
                continue
            
            # Parse the date row to extract dates
            date_parts = lines[date_row].strip().replace('"', '').split(',')
            
            # Clean up date parts - remove any empty strings or headers
            date_parts = [part.strip() for part in date_parts if part.strip()]
            
            # Identify where the actual dates start (skip headers like "Geography")
            start_idx = 0
            for i, part in enumerate(date_parts):
                if (re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[- ]\d{2}', part) or
                    re.search(r'(January|February|March|April|May|June|July|August|September|October|November|December)[ -]\d{4}', part)):
                    start_idx = i
                    break
            
            # Extract the dates
            dates = []
            for i in range(start_idx, len(date_parts)):
                date_str = date_parts[i].strip()
                
                if date_str and date_str != '..':
                    # Parse date in format like "Jan-06" or "January 2006"
                    if '-' in date_str:
                        match = re.search(r'([A-Za-z]{3})-(\d{2})', date_str)
                        if match:
                            month_abbr, year = match.groups()
                            month_map = {
                                'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                                'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                                'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
                            }
                            month = month_map.get(month_abbr, '01')
                            year = f"20{year}" if int(year) < 50 else f"19{year}"
                            date = f"{year}-{month}-01"
                            dates.append(date)
                    else:
                        # Try to match "January 2006" format
                        match = re.search(r'([A-Za-z]+)[ -](\d{4})', date_str)
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
            
            print(f"Extracted {len(dates)} date values")
            
            # Now process each location row
            for i in range(data_start_row, len(lines)):
                line = lines[i].strip()
                if not line:
                    continue
                
                # Split line into parts
                parts = line.replace('"', '').split(',')
                if len(parts) < start_idx + len(dates):
                    continue
                
                # Extract location name
                location_name = parts[0].strip()
                if not location_name:
                    continue
                
                print(f"Processing location: {location_name}")
                
                # Assign GeoID based on location name
                geo_id = assign_geo_id(location_name)
                
                # Extract values for each date
                for j, date in enumerate(dates):
                    if date is None:
                        continue
                    
                    value_idx = start_idx + j
                    if value_idx < len(parts):
                        value_str = parts[value_idx].strip()
                        
                        if value_str and value_str != '..' and value_str != 'F':
                            try:
                                value = float(value_str)
                                
                                # Create data point
                                data_point = {
                                    "Date": date + "T00:00:00",
                                    "GeoID": geo_id,
                                    "GeoName": location_name,
                                    "Characteristics": "Unemployment rate",
                                    "Value": value
                                }
                                all_data.append(data_point)
                            except ValueError:
                                pass
                
        except Exception as e:
            print(f"Error processing file {file_path}: {str(e)}")
    
    print(f"Total data points collected: {len(all_data)}")
    return all_data

def assign_geo_id(location_name):
    """
    Assign a placeholder GeoID based on location name
    In a production system, this would be mapped to actual geographic identifiers
    """
    # Dictionary of common provinces/territories and their IDs
    province_map = {
        "Alberta": "48",
        "British Columbia": "59",
        "Manitoba": "46",
        "New Brunswick": "13",
        "Newfoundland and Labrador": "10",
        "Nova Scotia": "12",
        "Ontario": "35",
        "Prince Edward Island": "11",
        "Quebec": "24",
        "Saskatchewan": "47",
        "Northwest Territories": "61",
        "Nunavut": "62",
        "Yukon": "60"
    }
    
    # Check if the location name is a province
    if location_name in province_map:
        return province_map[location_name]
    
    # For other cities/locations, generate a simple hash-based ID
    # In a real system, this would be replaced with actual geographic IDs
    return str(abs(hash(location_name)) % 1000)

def create_city_json(data, output_file):
    """
    Create the city.json file from the processed data
    """
    # Filter out any incomplete data points
    valid_data = [item for item in data if all(k in item for k in ["Date", "GeoID", "GeoName", "Characteristics", "Value"])]
    
    # Write to JSON file
    with open(output_file, 'w') as f:
        json.dump(valid_data, f, indent=2)
    
    print(f"Created {output_file} with {len(valid_data)} records")
    
    # Print a summary of data by location
    location_counts = {}
    for item in valid_data:
        geo_name = item["GeoName"]
        if geo_name in location_counts:
            location_counts[geo_name] += 1
        else:
            location_counts[geo_name] = 1
    
    print("Location summary:")
    for loc, count in sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {loc}: {count} records")

def main():
    # Directory path containing the CSV files
    directory_path = "/tmp/1410038001"
    
    # Process CSV files
    data = process_city_csv_files(directory_path)
    
    # Create output directory if it doesn't exist
    output_dir = os.path.join(directory_path, "output")
    os.makedirs(output_dir, exist_ok=True)
    
    # Create JSON file
    create_city_json(data, os.path.join(output_dir, "city.json"))
    
    print("Data processing completed successfully")

if __name__ == "__main__":
    main()
