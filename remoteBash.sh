#!/bin/bash 
TESTNET_BYBIT="https://testnet.bybit.com"
REMOTE_PROJECT_PATH="/var/www/trading-chatgpt"


alias killScreens="screen -ls | grep Detached | cut -d. -f1 | awk '{print $1}' | xargs -I % screen -X -S % quit"
alias killServers="screen -d; ps -ax | grep -i manage.py | cut -d ' ' -f 1 | xargs kill -9;  pm2 delete all; pm2 kill; pkill -9 node"
alias killAll="killServers; killScreens"
alias restart="killAll; ./startScreen.sh"
alias recreateDB="cd trading-bot-centralization-server/trading_center && rm -rf db.sqlite3 && python manage.py makemigrations && python manage.py migrate && cd ../.."




alias cdProject="cd $REMOTE_PROJECT_PATH"