#!/bin/bash

# Start a new tmux session
tmux new-session -d -s my_session

# Rename the first window and run the command
tmux rename-window -t my_session 'FrontEnd'
tmux send-keys -t my_session 'cd SimpleFrontEnd/desktop' C-m

# Create other windows and run their startup commands
tmux split-window -h -t my_session
tmux send-keys -t my_session:0.1 'cd Shared' C-m

tmux split-window -h -t my_session
tmux send-keys -t my_session:0.2 'cd trading-bot-backend' C-m

tmux split-window -h -t my_session
tmux send-keys -t my_session:0.3 'cd trading-bot-strategy-analyzer' C-m

tmux split-window -h -t my_session
tmux send-keys -t my_session:0.4 'cd trading-bot-centralization-server' C-m
tmux send-keys -t my_session:0.4 'source env/bin/activate' C-m
tmux send-keys -t my_session:0.4 'cd trading-center' C-m
tmux send-keys -t my_session:0.4 'python3 manage.py runserver' C-m

# Attach to the session
tmux attach -t my_session
