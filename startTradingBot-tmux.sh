#!/bin/bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

# Name of the tmux session
session="trading_bot"

# Start new tmux session
tmux new-session -d -s $session

# Create a 2x2 grid layout
tmux split-window -t $session -h
tmux split-window -t $session -v
tmux select-pane -t $session.1
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
    
    # Send the component name and command to start to each pane
    tmux send-keys -t $session.$((pane_index * 2 + 1)) "cd $component && clear" C-m
    tmux send-keys -t $session.$((pane_index * 2 + 1)) "echo '$component_name'" C-m
    tmux send-keys -t $session.$((pane_index * 2 + 1)) "yarn start" C-m
    ((pane_index++))
done

# Attach to the tmux session
tmux attach-session -t $session
