#!/bin/bash

# Kill existing session
tmux kill-session -t my_session 2>/dev/null

# Start a new tmux session
tmux new-session -d -s my_session

# Rename the first window and run the command
tmux rename-window -t my_session 'FrontEnd'
tmux send-keys -t my_session 'cd SimpleFrontEnd/desktop; yarn dev' C-m
tmux send-keys -t my_session 'PS1="FrontEnd ${PWD/*\//}# "; clear' C-m

# Create other windows and run their startup commands
tmux split-window -h -t my_session
tmux send-keys -t my_session:0.1 'pwd' C-m
tmux send-keys -t my_session:0.1 'PS1="Commands ${PWD/*\//}# "; clear' C-m


tmux split-window -h -t my_session
tmux send-keys -t my_session:0.2 'cd Testing' C-m
tmux send-keys -t my_session:0.2 'PS1="Testing ${PWD/*\//}# "; clear' C-m


tmux split-window -h -t my_session
tmux send-keys -t my_session:0.3 'cd Shared' C-m
tmux send-keys -t my_session:0.3 'PS1="Shared ${PWD/*\//}# "; clear' C-m

tmux split-window -h -t my_session
tmux send-keys -t my_session:0.4 'cd trading-bot-backend; yarn dev' C-m
tmux send-keys -t my_session:0.4 'PS1="Backend ${PWD/*\//}# "; clear' C-m

tmux split-window -h -t my_session
tmux send-keys -t my_session:0.5 'cd trading-bot-strategy-analyzer; sleep 10 ; yarn dev' C-m
tmux send-keys -t my_session:0.5 'PS1="StrategyAnalyzer ${PWD/*\//}# "; clear' C-m

tmux split-window -v -t my_session
tmux send-keys -t my_session:0.6 'cd trading-bot-centralization-server' C-m
tmux send-keys -t my_session:0.6 'source env/bin/activate' C-m
tmux send-keys -t my_session:0.6 'cd trading-center' C-m
tmux send-keys -t my_session:0.6 'python3 manage.py runserver' C-m
tmux send-keys -t my_session:0.6 'PS1="CentralizationServer ${PWD/*\//}# "; clear' C-m

# Attach to the session
tmux attach -t my_session
