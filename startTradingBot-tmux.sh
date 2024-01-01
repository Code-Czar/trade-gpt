#!/bin/bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

# Name of the tmux session
session="trading_bot"

# Start new tmux session
tmux new-session -d -s $session

# Create a 2x2 grid layout of panes
tmux split-window -t $session -h
tmux split-window -t $session -v
tmux select-pane -t $session.0
tmux split-window -t $session -v
tmux select-pane -t $session.2
tmux split-window -t $session -v

# List of trading bot components with commands to run and their corresponding names
components=("trading-bot-backend" "trading-bot-position-manager" "trading-bot-strategy-analyzer" "trading-bot-centralization-server")
component_names=("Backend" "Position Manager" "Strategy Analyzer" "Centralization Server")

# Start each component in separate panes within the grid layout
pane_index=0
for component in "${components[@]}"
do
    # Define the component name
    component_name="${component_names[$pane_index]}"
    
    # Set the pane title
    tmux select-pane -t $session.$pane_index
    tmux rename-window "$component_name"
    
    # Check if the component is the centralization server
    if [ "$component" == "trading-bot-centralization-server" ]; then
        # Start the centralization server with its specific commands
        tmux send-keys -t $session.$pane_index "cd $component && source env/bin/activate && cd trading_center/ && python manage.py runserver" C-m
    else
        # Start other components with 'yarn start'
        tmux send-keys -t $session.$pane_index "cd $component && clear" C-m
        tmux send-keys -t $session.$pane_index "yarn start" C-m
    fi
    ((pane_index++))
done

# Attach to the tmux session
tmux attach-session -t $session
