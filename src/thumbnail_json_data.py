import os
import json
import glob
import datetime

def preview_json_data():
    """
    Generate filenames and content preview of JSON files in public/data/*.json
    Format the output in markdown style with JSON code blocks
    Save the output to a file in /tmp/ directory
    """
    # Create output file path with timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    output_file = f"/tmp/json_preview_{timestamp}.md"
    
    # Open the output file
    with open(output_file, 'w', encoding='utf-8') as out_file:
        # Determine the project root more reliably
        # Assuming the script is in src/ and JSON files are in public/data/
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(current_dir)  # Just one level up from src/
        
        # Path to JSON files
        json_path = os.path.join(project_root, "public", "data", "*.json")
        
        # Write debugging info to file
        out_file.write(f"Searching for JSON files in: {json_path}\n\n")
        
        # Get all JSON files
        json_files = glob.glob(json_path)
        
        # If no files found, try an alternative path
        if not json_files:
            alternative_path = os.path.join(os.getcwd(), "public", "data", "*.json")
            out_file.write(f"No files found. Trying alternative path: {alternative_path}\n\n")
            json_files = glob.glob(alternative_path)
        
        if not json_files:
            out_file.write("No JSON files found. Please check if the path is correct.\n")
            print(f"No JSON files found. Output saved to: {output_file}")
            return
            
        out_file.write(f"Found {len(json_files)} JSON files\n\n")
        
        for file_path in json_files:
            # Get the filename from the path
            filename = os.path.basename(file_path)
            
            try:
                # Open and load the JSON file
                with open(file_path, 'r', encoding='utf-8') as file:
                    data = json.load(file)
                    
                # Get a preview of the data (first item if it's an array)
                preview = None
                if isinstance(data, list) and len(data) > 0:
                    preview = data[0]
                else:
                    preview = data
                    
                # Limit preview size to avoid very large outputs
                preview_str = json.dumps(preview, indent=2)
                
                # Write the filename and preview in markdown format
                out_file.write(f"### {filename}\n\n")
                out_file.write("```json\n")
                out_file.write(preview_str)
                out_file.write("\n```\n\n")
                out_file.write("----\n\n")
                
            except Exception as e:
                out_file.write(f"### {filename}\n\n")
                out_file.write(f"Error processing file: {str(e)}\n\n")
                out_file.write("----\n\n")
    
    print(f"JSON preview generated and saved to: {output_file}")

if __name__ == "__main__":
    preview_json_data()
