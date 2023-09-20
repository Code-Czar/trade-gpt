#!/bin/bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

source ~/.bashrc
# Name of the screen session
session="trading_bot"

# Start new screen session
screen -dmS $session

# List of trading bot components with npm start command
components=("trading-bot-backend"  "trading-bot-position-manager" "trading-bot-strategy-analyzer")
# components=("trading-bot-strategy-analyzer")

# Start the Django server in a new screen window
screen -S $session -X screen -t "trading-bot-centralization-server" bash -c "cd trading-bot-centralization-server && source env/bin/activate && cd trading_center && python manage.py runserver; read"
wait 5

# Start each component in a new screen window
for component in "${components[@]}"
do
    # Navigate to component directory and run 'yarn start', then wait for user input
    screen -S $session -X screen -t $component bash -c "cd $component && yarn start; read"
done



# Attach to the screen session
screen -r $session
