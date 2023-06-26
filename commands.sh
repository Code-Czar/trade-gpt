#!/bin/bash 

alias pushToGit="ssh-add ~/.ssh/Code-Czar && git push origin main"
alias killAll="ps -ax | grep -i manage.py | cut -d ' ' -f 1 | xargs kill -9; pkill -9 node"
alias restart="killAll; ./startScreen.sh"

alias recreateDB="cd trading-bot-centralization-server/trading_center && rm db.sqlite3 && python manage.py makemigrations && python manage.py migrate && cd ../.."