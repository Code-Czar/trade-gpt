#!/bin/bash 
TESTNET_BYBIT="https://testnet.bybit.com"
PROJECT_PATH="/Users/beniben/Domaines_De_Vie/Business/GPT_Trading"

# Init
# alias nvm="~/.nvm/nvm.sh"
# nvm use 18.0

alias pushToGit="ssh-add ~/.ssh/Code-Czar && git push origin main"

# Workflow
alias killScreens="screen -ls | grep Detached | cut -d. -f1 | awk '{print $1}' | xargs -I % screen -X -S % quit"
alias killServers="screen -d; ps -ax | grep -i manage.py | cut -d ' ' -f 1 | xargs kill -9;  pm2 delete all; pm2 kill; pkill -9 node"
alias killAll="killServers; killScreens"
alias restart="killAll; ./startScreen.sh"
alias deploy="rsync -avz -e 'ssh -p 2233' . beniben@$ipserver:/var/www/trading-chatgpt"
alias deployPI1="deploy_to_pi 2233 \"beniben\" \"$rpi1\" \"/var/www/trading-chatgpt\""
alias deployPI2="deploy_to_pi 2233 \"beniben\" \"$rpi2\" \"/var/www/trading-chatgpt\""
# alias deployPI2="rsync -avz --exclude=node_modules --exclude=env --exclude .git -e 'ssh -p 2233' . beniben@$rpi2:/var/www/trading-chatgpt"

alias recreateDB="cd trading-bot-centralization-server/trading_center && rm -rf db.sqlite3 && python manage.py makemigrations && python manage.py migrate && cd ../.."

alias openByBit="open $TESTNET_BYBIT"
alias cdProject="cd $PROJECT_PATH"


function deploy_to_pi() {
    local port="$1"
    local user="$2"
    local ip="$3"
    local path="$4"
    
    echo "$port $user $ip $path"
    rsync -avz --exclude=node_modules --exclude=env --exclude .git -e "ssh -p $port" . "$user@$ip:$path"
    ssh -p $port "$user@$ip" "cp $path/remoteBash.sh ~/.bashrc"
}
function send_ssh_key() {
    local port="$1"
    local user="$2"
    local ip="$3"
    local path="$4"
    
    echo "$port $user $ip $path"
    rsync -avz --exclude=node_modules --exclude=env --exclude .git -e "ssh -p $port" ~/.ssh/id_rsa.pub "$user@$ip:/tmp"
    ssh -p $port "$user@$ip" "cat /tmp/id_rsa.pub >> ~/.ssh/authorized_keys"
}


# Start services 
alias startFront="cd trading-bot-frontend; yarn start"
alias startBack="cd trading-bot-backend; yarn start"