#!/bin/bash

# update_tools.sh - Tool update script for Shinkai
#
# This script downloads and updates tools from the Shinkai store.
# It compares versions and only downloads if a newer version is available.
#
# Usage:
#   ./update_tools.sh              # Normal update (only newer versions)
#   ./update_tools.sh --force      # Force download all tools regardless of version
#

# Parse command line arguments
FORCE_DOWNLOAD=false
for arg in "$@"; do
    case $arg in
        --force)
            FORCE_DOWNLOAD=true
            shift
            ;;
    esac
done
# Function to sanitize strings (lowercase and safe characters only)
sanitize_string() {
    if [ -z "$1" ]; then
        echo ""
        return
    fi
    # Convert to lowercase and remove any characters that aren't alphanumeric, dots, hyphens, or underscores
    echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9._-]//g'
}

# Function to extract value from JSON for a given key
extract_json_value() {
    local json="$1"
    local key="$2"
    echo "$json" | grep -o "\"$key\": *\"[^\"]*\"" | sed "s/\"$key\": *\"\([^\"]*\)\"/\1/"
}

# Function to compare version numbers
# Returns: 0 if versions are equal, 1 if version1 > version2, 2 if version1 < version2
compare_versions() {
    local version1=$1
    local version2=$2
    
    # Split versions into arrays
    IFS='.' read -ra v1 <<< "$version1"
    IFS='.' read -ra v2 <<< "$version2"
    
    # Compare each part
    for i in "${!v1[@]}"; do
        if [ "${v1[$i]}" -gt "${v2[$i]}" ]; then
            return 1
        elif [ "${v1[$i]}" -lt "${v2[$i]}" ]; then
            return 2
        fi
    done
    
    return 0
}

# Function to get current version from installed zip file
get_current_version() {
    local tool_name=$1
    local tool_dir="./apps/shinkai-desktop/src-tauri/pre-install"
    
    # Find the most recent zip file for this tool
    local latest_file=$(find "$tool_dir" -name "${tool_name}_*.zip" | sort -V | tail -n1)
    
    if [ ! -z "$latest_file" ]; then
        # Extract version from filename (remove .zip and get everything after the last underscore)
        local version=$(basename "$latest_file" .zip | sed "s/${tool_name}_//")
        echo "$version"
    else
        echo ""
    fi
}

# Step 1: Get the list of default tools
echo "Fetching default tools from store..."
TOOLS_JSON=$(curl -s https://store-api.shinkai.com/store/defaults)

# Create a list of current tool names
echo "Creating list of current tools..."
CURRENT_TOOLS=$(echo "$TOOLS_JSON" | sed 's/^\[//' | sed 's/\]$//' | tr '}' '\n' | while read -r tool; do
    if [ ! -z "$tool" ]; then
        name=$(extract_json_value "$tool" "name")
        if [ ! -z "$name" ]; then
            echo "$(sanitize_string "$name")"
        fi
    fi
done)

# Step 2: Create pre-install folder if it doesn't exist
echo "Setting up pre-install directory..."
mkdir -p "./apps/shinkai-desktop/src-tauri/pre-install"

# Clean up old tool files
echo "Cleaning up old tool files..."
if [ -d "./apps/shinkai-desktop/src-tauri/pre-install" ]; then
    find "./apps/shinkai-desktop/src-tauri/pre-install" -name "*.zip" | while read -r file; do
        filename=$(basename "$file")
        tool_name=$(echo "$filename" | cut -d'_' -f1)
        
        # Check if this tool is still in the current tools list
        if ! echo "$CURRENT_TOOLS" | grep -q "^$tool_name$"; then
            echo "Removing old tool: $filename"
            rm -f "$file"
        fi
    done
fi

# Step 3: Process and sort tools
echo "Processing and sorting tools..."
# Create a temporary file to store tool data
TEMP_FILE=$(mktemp)

# Extract and format tool data for sorting
echo "$TOOLS_JSON" | sed 's/^\[//' | sed 's/\]$//' | tr '}' '\n' | while read -r tool; do
    if [ ! -z "$tool" ]; then
        name=$(extract_json_value "$tool" "name")
        if [ ! -z "$name" ]; then
            # Store the complete tool JSON with the name as a prefix for sorting
            echo "$name|$tool" >> "$TEMP_FILE"
        fi
    fi
done

# Step 4: Download sorted tools
echo "Downloading tool files..."
# Sort the temporary file by name and process each tool
sort -f "$TEMP_FILE" | while IFS='|' read -r name tool; do
    if [ ! -z "$tool" ]; then
        # Extract values using our custom function
        version=$(extract_json_value "$tool" "version")
        file_url=$(extract_json_value "$tool" "file")
        
        # Skip empty entries
        if [ ! -z "$name" ] && [ ! -z "$version" ] && [ ! -z "$file_url" ]; then
            # Sanitize the name and version
            sanitized_name=$(sanitize_string "$name")
            sanitized_version=$(sanitize_string "$version")
            
            # Check if we need to download
            current_version=$(get_current_version "$sanitized_name")
            should_download=$FORCE_DOWNLOAD
            
            if [ -z "$current_version" ]; then
                should_download=true
            else
                compare_versions "$sanitized_version" "$current_version"
                case $? in
                    1) should_download=true ;;  # New version is greater
                    0) should_download=$FORCE_DOWNLOAD ;;  # Versions are equal
                    2) should_download=$FORCE_DOWNLOAD ;;  # New version is less
                esac
            fi
            
            if [ "$should_download" = true ]; then
                echo "Processing $name v$version"
                
                # Download the file
                curl -L "$file_url" -o "./apps/shinkai-desktop/src-tauri/pre-install/${sanitized_name}_${sanitized_version}.zip"
                
                # Print to console
                echo "Downloaded: $name v$version"
            else
                echo "Skipping $name v$version (current version: $current_version)"
            fi
        fi
    fi
done

# Clean up temporary file
rm -f "$TEMP_FILE"

echo "All tools have been downloaded and processed!"

