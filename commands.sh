#!/bin/bash 

alias pushToGit="ssh-add ~/.ssh/Code-Czar && git push origin main"
alias killScreens="screen -ls | grep Detached | cut -d. -f1 | awk '{print $1}' | xargs -I % screen -X -S % quit"
alias killServers="screen -d; ps -ax | grep -i manage.py | cut -d ' ' -f 1 | xargs kill -9;  pm2 delete all; pm2 kill; pkill -9 node"
alias killAll="killServers; killScreens"
alias restart="killAll; ./startScreen.sh"
alias deploy="rsync -avz -e 'ssh -p 2233' . beniben@$ipserver:/var/www/trading-chatgpt"
alias deployPI1="rsync -avz --exclude=node_modules --exclude=env --exclude .git -e 'ssh -p 2233' . beniben@$rpi1:/var/www/trading-chatgpt"

alias recreateDB="cd trading-bot-centralization-server/trading_center && rm -rf db.sqlite3 && python manage.py makemigrations && python manage.py migrate && cd ../.."