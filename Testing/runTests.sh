#!/bin/bash

ENVIRONMENT=$1  # local, staging, or production
echo $ENVIRONMENT

SHARED_LIB_FOLDER="../Shared"
SHARED_CONFIG_FOLDER="src/consts"
CONFIG_FILE="$SHARED_CONFIG_FOLDER/config_${ENVIRONMENT}.json"

# Set shared config
pwd
cd $SHARED_LIB_FOLDER
cp $CONFIG_FILE $SHARED_CONFIG_FOLDER/config.json
yarn build
cd ..
make link_shared_lib
cd Testing
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

    # Run Mocha tests for each folder in apiComponents
    for dir in ./apiComponents/*; do
        if [ -d "$dir" ]; then
            echo "Running tests in $dir"
            # yarn mocha "$dir"/*.test.js >> testResults.txt
            # yarn mocha --reporter mocha-multi --reporter-options spec=-,mocha-file-reporter=./test-results.txt "$dir"/*.test.js
            yarn mocha --reporter mochawesome "$dir"/*.test.js | tee test-results.txt

        fi
    done

    # Add other test directories as needed
    # mocha ./another-component-tests/*.test.js
else
    echo "Configuration file for $ENVIRONMENT does not exist."
fi

echo "####### END TESTS #######"


cd $SHARED_LIB_FOLDER
pwd
cp $SHARED_CONFIG_FOLDER/config_local.json $SHARED_CONFIG_FOLDER/config.json
yarn build 
cd ..
make link_shared_lib