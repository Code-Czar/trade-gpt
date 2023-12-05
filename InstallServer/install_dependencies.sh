#!/usr/bin/expect -f

# Define the log file path
set log_file "install_dependencies.log"

# Source the common library file
source utils.exp

# Collect arguments
set root_user [lindex $argv 0]
set normal_user [lindex $argv 1]
set remote_ip [lindex $argv 2]
set remote_port [lindex $argv 3]
set root_password [lindex $argv 4]
set op_dev_user_password [lindex $argv 5]
set public_keys_files [split [lindex $argv 6] ","]
set local_folder [lindex $argv 7]

# # Enable logging to both file and stdout
# log_file -a $log_file
# log_user 1

# # Install Apache2
# execute_remote $root_user $remote_ip $remote_port $root_password "apt-get update && apt-get install -y apache2" $log_file

# # Install Certbot
# execute_remote $root_user $remote_ip $remote_port $root_password "apt-get install -y certbot python3-certbot-apache" $log_file

# # Switch to normal_user for NVM and Node.js installation
# set nvm_install_script "runuser -l $normal_user -c 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash'"
# set node_install_commands "runuser -l $normal_user -c 'export NVM_DIR=~/.nvm && \[ -s \$NVM_DIR/nvm.sh \] && . \$NVM_DIR/nvm.sh && nvm install 18.0 && npm install -g yarn'"

# execute_remote $root_user $remote_ip $remote_port $root_password $nvm_install_script $log_file
# execute_remote $root_user $remote_ip $remote_port $root_password $node_install_commands $log_file

# puts "Installation of dependencies completed."

# # Install Python 3.11 using root_user
# execute_remote $root_user $remote_ip $remote_port $root_password "apt-get install -y python3.11" $log_file

# # Install InfluxDB
# execute_remote $root_user $remote_ip $remote_port $root_password "apt-get install -y influxdb" $log_file

# # Install Telegraf
# execute_remote $root_user $remote_ip $remote_port $root_password "apt-get install -y telegraf" $log_file

# # Install Fail2ban
# execute_remote $root_user $remote_ip $remote_port $root_password "apt-get install -y fail2ban" $log_file

# # Install locate 
# execute_remote $root_user $remote_ip $remote_port $root_password "apt-get install -y locate" $log_file

puts "Installation of dependencies completed."
