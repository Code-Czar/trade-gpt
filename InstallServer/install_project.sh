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
set email_address "contact@benjamintourrette.com" 
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

# Install Certbot
execute_remote $root_user $remote_ip $remote_port $root_password "apt-get update" $log_file
execute_remote $root_user $remote_ip $remote_port $root_password "apt-get install certbot python3-certbot-apache -y" $log_file

# Generate SSL certificate with Certbot
set certbot_command "certbot --apache -d $domain_name -m $email_address --agree-tos"
execute_remote $root_user $remote_ip $remote_port $root_password "$certbot_command" $log_file

# Configure Apache to auto-redirect to HTTPS
set apache_config_file "/etc/apache2/sites-available/$domain_name.conf"
set redirect_config "Redirect permanent / https://$domain_name/"

# Activate the Apache SSL configuration
execute_remote $root_user $remote_ip $remote_port $root_password "a2enmod ssl" $log_file

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
