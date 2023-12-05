#!/usr/bin/expect -f

# Define the log file path
set log_file "initial_setup.log"

# Source the common library file
source utils.exp

# Collect arguments
set remote_user [lindex $argv 0]
set remote_ip [lindex $argv 1]
set remote_port [lindex $argv 2]
set root_password [lindex $argv 3]
set op_dev_user_password [lindex $argv 4]
set public_keys_files [split [lindex $argv 5] ","]
set local_folder [lindex $argv 6]
set remote_folder "/var/www/trading-gpt"  

# Execute commands
execute_remote $remote_user $remote_ip $remote_port $root_password "useradd -m opDevUser && echo 'opDevUser:$op_dev_user_password' | chpasswd" $log_file

# # Create folder and change rights
execute_remote $remote_user $remote_ip $remote_port $root_password "mkdir -p /var/www/trading-shared && chown -R opDevUser:www-data /var/www" $log_file

# # Generate SSH key and set up authorized_keys
execute_remote $remote_user $remote_ip $remote_port $root_password "runuser -l opDevUser -c 'ssh-keygen -t rsa -N \"\" -f ~/.ssh/id_rsa <<<n'" $log_file

# Add public keys to authorized_keys
foreach key_file $public_keys_files {
    set key [exec cat $key_file]
    execute_remote $remote_user $remote_ip $remote_port $root_password "runuser -l opDevUser -c 'echo $key >> ~/.ssh/authorized_keys'" $log_file
}

# Change SSH incoming port
execute_remote $remote_user $remote_ip $remote_port $root_password "sed -i 's/#Port 22/Port 2233/' /etc/ssh/sshd_config && systemctl restart sshd" $log_file

# Install rsync on the remote server
execute_remote $remote_user $remote_ip $remote_port $root_password "apt-get update && apt-get install -y rsync xsel xclip tmux" $log_file


puts "Initial setup completed."