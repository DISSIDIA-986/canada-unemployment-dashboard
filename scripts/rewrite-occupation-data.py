import pandas as pd
import json
import os
from datetime import datetime
import numpy as np

# Path to input CSV file
input_file = '/Users/niuyp/Downloads/1410042101_databaseLoadingData2.csv'

# Path to output JSON file
output_dir = 'public/data'
output_file = os.path.join(output_dir, 'occupation.json')

# Create the output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

# Read the CSV file
df = pd.read_csv(input_file)

# Format the data into the required JSON structure
formatted_data = []

for _, row in df.iterrows():
    try:
        # Convert date format (assuming REF_DATE is in 'MMM-YY' format)
        date_obj = pd.to_datetime(row['REF_DATE'], format='%b-%y')
        formatted_date = date_obj.strftime('%Y-%m-%d') + 'T00:00:00'

        # Default values for fields that might be missing
        geo_id = 48  # Default to Alberta's code
        geo_name = row['GEO'] if pd.notna(row['GEO']) else "Unknown"
        labor_char = row['Labour force characteristics'] if pd.notna(row['Labour force characteristics']) else "Unknown"
        noc = row['National Occupational Classification (NOC)'] if pd.notna(
            row['National Occupational Classification (NOC)']) else "Unknown"
        gender = row['Gender'] if pd.notna(row['Gender']) else "Unknown"
        value = row['VALUE'] if pd.notna(row['VALUE']) else None

        # Extract NOC code and description
        noc_code = "Unknown"
        noc_desc = "Unknown"
        if noc != "Unknown" and "[" in noc:
            parts = noc.split('[')
            noc_code = parts[1].strip(']').strip() if len(parts) > 1 else "Unknown"
            noc_desc = parts[0].strip()

        # Create entry using the desired format
        entry = {
            "Date": formatted_date,
            "GeoID": geo_id,
            "GeoName": geo_name,
            "Characteristics": "Unemployment rate" if "Unemployment" in labor_char else labor_char,
            "NOC": noc_code,
            "NOC Description": noc_desc,
            "Sex": gender,
            "Value": value
        }

        formatted_data.append(entry)
    except Exception as e:
        print(f"Error processing row: {row}")
        print(f"Error details: {e}")
        # Continue with next row instead of crashing

# Write the formatted data to JSON file
with open(output_file, 'w', encoding='utf-8') as f:
    # Use default=str to handle any remaining non-serializable objects
    json.dump(formatted_data, f, indent=2, default=str)

print(f"Data has been successfully exported to {output_file}")
print(f"Total records processed: {len(formatted_data)}")