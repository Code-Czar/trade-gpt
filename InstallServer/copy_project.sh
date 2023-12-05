#!/bin/bash

# Collect arguments
root_user="$1"
normal_user="$2"
remote_ip="$3"
remote_port="$4"
root_password="$5"
domain_name="$6"  
public_keys_files=("${@:7}") # Assuming public keys are the 7th and subsequent arguments
local_folder="${8}" # Assuming the local folder is the 8th argument
project_folder="/var/www/trading-gpt"

# Echo for debugging
echo "Source Folder: $local_folder"
echo "Destination: ${normal_user}@${remote_ip}:${project_folder}"

# Rsync command using variables
rsync -arvvti -e "ssh -p $remote_port" "$local_folder" "${normal_user}@${remote_ip}:${project_folder}"
