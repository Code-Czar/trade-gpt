#!/bin/bash

ENVIRONMENT=$1  # local, staging, or production
echo $ENVIRONMENT

SHARED_LIB_FOLDER="../Shared"
SHARED_CONFIG_FOLDER="src/consts"
CONFIG_FILE="$SHARED_CONFIG_FOLDER/config_${ENVIRONMENT}.json"
LOCAL_CONFIG_FILE="$SHARED_CONFIG_FOLDER/config_local.json"

# Set shared config
pwd
cd $SHARED_LIB_FOLDER

cp $CONFIG_FILE $SHARED_CONFIG_FOLDER/config.json

# Check if rebuild is necessary
REBUILD_SHARED=false
if ! diff $SHARED_CONFIG_FOLDER/config.json $LOCAL_CONFIG_FILE > /dev/null; then
    REBUILD_SHARED=true
fi

if [ "$REBUILD_SHARED" = true ]; then
    yarn build
    cd ..
    make link_shared_lib
else
    echo "No changes in configuration, skipping rebuild."
fi

cd ../Testing
clear

echo "####### STARTING TESTS #######"
pwd
echo $CONFIG_FILE
CONFIG_FILE=$SHARED_LIB_FOLDER/$CONFIG_FILE

# Check if the configuration file exists
if [ -f "$CONFIG_FILE" ]; then
    # Extract and export variables from the JSON file
    export REMOTE_URL=$(sed -n 's/ *"REMOTE_URL": *"\(.*\)",/\1/p' "$CONFIG_FILE")
    export REMOTE_WSS=$(sed -n 's/ *"REMOTE_WSS": *"\(.*\)"/\1/p' "$CONFIG_FILE")
    echo $REMOTE_URL
    echo $REMOTE_WSS

    # Run Mocha tests for all files in apiComponents
    yarn mocha --reporter mochawesome --reporter-options reportDir=./reports,reportFilename=combined_report "./apiComponents/**/*.test.js" | tee ./reports/apiComponents_test-results.txt

    # Add other test directories as needed
    # mocha ./another-component-tests/*.test.js
else
    echo "Configuration file for $ENVIRONMENT does not exist."
fi

echo "####### END TESTS #######"

# Rebuild to local config if necessary
if [ "$REBUILD_SHARED" = true ]; then
    cd $SHARED_LIB_FOLDER
    pwd
    cp $LOCAL_CONFIG_FILE $SHARED_CONFIG_FOLDER/config.json
    yarn build
    cd ..
    make link_shared_lib
else
    echo "Configuration already set to local, skipping rebuild."
fi
