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

# Copy telegraf.conf to the remote server
# Assuming that the telegraf.conf file is located in the same directory as the script
set local_telegraf_config_path "./telegraf.conf"
set remote_telegraf_config_path "/usr/local/etc/telegraf.conf"


# Execute commands
execute_remote $remote_user $remote_ip $remote_port $root_password "useradd -m opDevUser && echo 'opDevUser:$op_dev_user_password' | chpasswd" $log_file

# Create folder and change rights
execute_remote $remote_user $remote_ip $remote_port $root_password "mkdir -p /var/www/trading-shared && chown -R opDevUser:www-data /var/www && chmod -R g+rw  www-data:www-data && usermod -a -G www-data opDevUser" $log_file

# Generate SSH key and set up authorized_keys
execute_remote $remote_user $remote_ip $remote_port $root_password "runuser -l opDevUser -c 'ssh-keygen -t rsa -N \"\" -f ~/.ssh/id_rsa <<<n'" $log_file

# Add public keys to authorized_keys
foreach key_file $public_keys_files {
    set key [exec cat $key_file]
    execute_remote $remote_user $remote_ip $remote_port $root_password "runuser -l opDevUser -c 'echo $key >> ~/.ssh/authorized_keys'" $log_file
}

# Change SSH incoming port
execute_remote $remote_user $remote_ip $remote_port $root_password "sed -i 's/#Port 22/Port 2233/' /etc/ssh/sshd_config && systemctl restart sshd" $log_file

# Install rsync on the remote server
execute_remote $remote_user $remote_ip $remote_port $root_password "apt-get update && apt-get install -y rsync xsel xclip tmux build-essential python3-pip python3-venv influxdb postgresql postgresql-contrib ufw" $log_file
execute_remote $remote_user $remote_ip $remote_port $root_password "ufw enable" $log_file

# Install telegraf
execute_remote $remote_user $remote_ip $remote_port $root_password "wget -qO- https://repos.influxdata.com/influxdb.key | sudo apt-key add -" $log_file
execute_remote $remote_user $remote_ip $remote_port $root_password "sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys D8FF8E1F7DF8B07E" $log_file
execute_remote $remote_user $remote_ip $remote_port $root_password "echo \"deb https://repos.influxdata.com/debian \$(lsb_release -cs) stable\" | sudo tee /etc/apt/sources.list.d/influxdb.list" $log_file
execute_remote $remote_user $remote_ip $remote_port $root_password "apt-get update && apt-get install -y telegraf" $log_file

# Use scp to copy the file
# Note: Adjust the path of the telegraf.conf file if it's in a different directory
execute_remote_scp $remote_user $remote_ip $remote_port $root_password $local_telegraf_config_path $remote_telegraf_config_path $log_file

# Change ownership of the telegraf.conf file on the remote server
execute_remote $remote_user $remote_ip $remote_port $root_password "chown opDevUser:opDevUser /usr/local/etc/telegraf.conf" $log_file


puts "Initial setup completed."
