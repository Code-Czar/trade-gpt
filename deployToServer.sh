#!/bin/bash

# Check for environment argument
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 [staging|production]"
    exit 1
fi

ENVIRONMENT=$1
CONFIG_FILE="Shared/src/consts/config_${ENVIRONMENT}.json"

# Extract the IP address from the configuration file
if ! IP=$(jq -r '.REMOTE_URL' "$CONFIG_FILE" | sed 's|https://||g'); then
    echo "Error: Failed to parse IP address from $CONFIG_FILE"
    exit 1
fi

# Define other variables
remote_port=2233
normal_user='opDevUser'
local_folder='.' # Adjust this to the correct local folder path
project_folder='/var/www/trading-gpt'

# Build
nvm use 18.0
cd Shared; yarn build;  cd - ; make  link_shared_lib;  cd SimpleFrontEnd/desktop; yarn build; cd -

# Rsync command
rsync -arvvvti --exclude 'env/' --chown=www-data:www-data --chmod=Du=rwx,Dgo=rwx,Fu=rw,Fog=rw -e "ssh -p $remote_port" "$local_folder" "${normal_user}@${IP}:${project_folder}"
