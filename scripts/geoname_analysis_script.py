import json
import os
import requests
from collections import defaultdict

def download_json_files(base_url, download_dir):
    """
    Download JSON files from the specified OSS base URL.
    
    :param base_url: Base URL for JSON files
    :param download_dir: Directory to save downloaded files
    :return: List of downloaded file paths
    """
    # Create download directory if it doesn't exist
    os.makedirs(download_dir, exist_ok=True)
    
    # List of JSON files to download
    json_files = [
        'age.json', 'alberta.json', 'city.json', 'education.json', 
        'industry.json', 'occupation.json', 'province.json', 
        'region.json', 'sex.json'
    ]
    
    downloaded_files = []
    
    for filename in json_files:
        url = f"{base_url}{filename}"
        local_path = os.path.join(download_dir, filename)
        
        try:
            # Download the file
            response = requests.get(url)
            response.raise_for_status()  # Raise an exception for bad status codes
            
            # Save the file
            with open(local_path, 'w', encoding='utf-8') as f:
                f.write(response.text)
            
            downloaded_files.append(local_path)
            print(f"Successfully downloaded: {filename}")
        
        except requests.RequestException as e:
            print(f"Error downloading {filename}: {e}")
    
    return downloaded_files

def analyze_geonames(json_files_dir):
    """
    Analyze distinct GeoName values across different JSON files.
    
    :param json_files_dir: Directory containing JSON files to analyze
    :return: Dictionary with file names and their unique GeoName values
    """
    # Dictionary to store unique GeoName values for each file
    geoname_analysis = defaultdict(set)
    
    # Iterate through JSON files in the directory
    for filename in os.listdir(json_files_dir):
        if filename.endswith('.json'):
            filepath = os.path.join(json_files_dir, filename)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Check if the file has a 'GeoName' key
                if data and isinstance(data[0], dict) and 'GeoName' in data[0]:
                    # Extract unique GeoName values
                    unique_geonames = set(item.get('GeoName', 'N/A') for item in data)
                    geoname_analysis[filename] = unique_geonames
                else:
                    print(f"No 'GeoName' key found in {filename}")
            
            except json.JSONDecodeError:
                print(f"Error decoding JSON in {filename}")
            except Exception as e:
                print(f"Unexpected error processing {filename}: {e}")
    
    return geoname_analysis

def print_geoname_analysis(geoname_analysis, output_file):
    """
    Print and save a detailed analysis of GeoName values.
    
    :param geoname_analysis: Dictionary with file names and their unique GeoName values
    :param output_file: Path to the output file
    """
    # Prepare analysis text
    analysis_text = "GeoName Analysis:\n" + "-" * 50 + "\n"
    
    for filename, geonames in geoname_analysis.items():
        analysis_text += f"\nFile: {filename}\n"
        analysis_text += f"Unique GeoNames: {len(geonames)}\n"
        
        # If only 'Canada' is present, highlight this
        if len(geonames) == 1 and 'Canada' in geonames:
            analysis_text += "⚠️ WARNING: Only 'Canada' present in this dataset!\n"
        
        # Print all unique values
        analysis_text += f"Values: {sorted(geonames)}\n"
    
    # Print to console
    print(analysis_text)
    
    # Save to output file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(analysis_text)
        print(f"\nAnalysis saved to {output_file}")
    except Exception as e:
        print(f"Error saving analysis to file: {e}")

def main():
    # OSS base URL for JSON files
    base_url = "https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/json-data/"
    
    # Download directory
    download_dir = "/tmp/json_files"
    
    # Output file path
    output_file = "/tmp/geoname_analysis.txt"
    
    # Download JSON files
    downloaded_files = download_json_files(base_url, download_dir)
    
    if not downloaded_files:
        print("No files were downloaded. Exiting.")
        return
    
    # Perform GeoName analysis
    geoname_analysis = analyze_geonames(download_dir)
    
    # Print and save analysis
    print_geoname_analysis(geoname_analysis, output_file)

if __name__ == "__main__":
    main()
