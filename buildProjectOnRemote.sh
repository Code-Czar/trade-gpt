#!/bin/bash 

projectPath="/var/www/trading-gpt"
sharedLibraryRoot="$projectPath/Shared"
frontEndRoot="$projectPath/SimpleFrontEnd/desktop"
backendRoot="$projectPath/trading-bot-backend"
centralizationRoot="$projectPath/trading-bot-centralization-server"



cd $projectPath

# Clean before build 
yarn cache clean 

#Shared lib
cd $sharedLibraryRoot
rm -rf node_modules yarn.lock
cp src/consts/config_production.json src/consts/config.json
yarn install
yarn build 


# Build frontend
cd $frontEndRoot
sudo chown  -R opDevUser:www-data $frontEndRoot/dist
rm -rf node_modules yarn.lock
yarn install
yarn build
sudo chown  -R www-data:www-data $frontEndRoot/dist

# Update Django WSGI 
# cd $centralizationRoot

sudo chown  -R opDevUser:opDevUser $centralizationRoot
rm -rf $centralizationRoot/env
virtualenv env 
source env/bin/activate
pip install -r requirements.txt
cp $centralizationRoot/trading_center/trading_center/wsgi_production.py $centralizationRoot/trading_center/trading_center/wsgi.py
sudo chown  -R www-data:www-data $centralizationRoot


