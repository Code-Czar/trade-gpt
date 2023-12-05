#!/usr/bin/expect -f

# Define the log file path
set log_file "install_project.log"

# Source the common library file
source utils.exp

# Collect arguments
set root_user [lindex $argv 0]
set normal_user [lindex $argv 1]
set remote_ip [lindex $argv 2]
set remote_port [lindex $argv 3]
set root_password [lindex $argv 4]
set domain_name [lindex $argv 5]  
set public_keys_files [split [lindex $argv 6] ","]
set local_folder [lindex $argv 7]
set project_folder "/var/www/trading-gpt"

# Enable logging to both file and stdout
log_file -a $log_file
log_user 1

# Change ownership of project folder
execute_remote $root_user $remote_ip $remote_port $root_password "chown -R opDevUser:www-data $project_folder" $log_file


# Go to project folder
execute_remote $root_user $remote_ip $remote_port $root_password "cd $project_folder" $log_file

# Configure Apache
# Replace ServerName with domain name URL in Apache config files
set backend_conf "$project_folder/trading-bot-backend/apache/backend-server-apache.conf"
set analyzer_conf "$project_folder/trading-bot-backend/apacheConf/strategy-analyzer.conf"
set fontend_conf "$project_folder/SimpleFrontEnd/apache/infinite-opportutnites.pro.conf"

execute_remote $root_user $remote_ip $remote_port $root_password "sed -i 's/ServerName .*/ServerName $domain_name/' $backend_conf" $log_file
execute_remote $root_user $remote_ip $remote_port $root_password "sed -i 's/ServerName .*/ServerName $domain_name/' $analyzer_conf" $log_file
execute_remote $root_user $remote_ip $remote_port $root_password "sed -i 's/ServerName .*/ServerName $domain_name/' $fontend_conf" $log_file

# Copy Apache config files to sites-available
execute_remote $root_user $remote_ip $remote_port $root_password "cp $backend_conf /etc/apache2/sites-available/" $log_file
execute_remote $root_user $remote_ip $remote_port $root_password "cp $analyzer_conf /etc/apache2/sites-available/" $log_file
execute_remote $root_user $remote_ip $remote_port $root_password "cp $fontend_conf /etc/apache2/sites-available/" $log_file

# Activate both websites in Apache
execute_remote $root_user $remote_ip $remote_port $root_password "a2ensite backend-server-apache.conf" $log_file
execute_remote $root_user $remote_ip $remote_port $root_password "a2ensite strategy-analyzer.conf" $log_file

# Activate mod_rewrite and proxy
execute_remote $root_user $remote_ip $remote_port $root_password "a2enmod rewrite proxy proxy_http" $log_file

# Restart Apache to apply changes
execute_remote $root_user $remote_ip $remote_port $root_password "systemctl restart apache2" $log_file

# Create virtual env for Django backend
set django_folder "$project_folder/trading-bot-centralization-server"
execute_remote $normal_user $remote_ip $remote_port $root_password "cd $django_folder && python3 -m venv env && source env/bin/activate && pip install -r requirements.txt" $log_file

# Set node 18.0 as default version
execute_remote $normal_user $remote_ip $remote_port $root_password "nvm alias default 18.0" $log_file

# Install each package dependencies
# Assuming a Makefile exists in the project root with an install target
execute_remote $normal_user $remote_ip $remote_port $root_password "cd $project_folder && make install" $log_file

puts "Project setup completed."
