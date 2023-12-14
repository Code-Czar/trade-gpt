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
set django_folder "$project_folder/trading-bot-centralization-server"
set tmux_config "$project_folder/InstallServer/.tmux.conf"

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

# Give access to backends private key for HTTPS
execute_remote $root_user $remote_ip $remote_port $root_password "rm -rf /etc/letsencrypt/live/$domain_name/privkey.pem" $log_file
execute_remote $root_user $remote_ip $remote_port $root_password "chown -R root:www-data /etc/letsencrypt" $log_file
execute_remote $root_user $remote_ip $remote_port $root_password "chmod -R g+rx root:www-data /etc/letsencrypt" $log_file
execute_remote $root_user $remote_ip $remote_port $root_password "ln -s /etc /etc/letsencrypt/live/$domain_name/privkey.pem /etc/letsencrypt/archive/$domain_name/privkey2.pem" $log_file
execute_remote $root_user $remote_ip $remote_port $root_password "chown -R root:www-data /etc /etc/letsencrypt/live/$domain_name/privkey.pem" $log_file
execute_remote $root_user $remote_ip $remote_port $root_password "chmod -R g+rx root:www-data /etc/letsencrypt/live/$domain_name/privkey.pem" $log_file
execute_remote $root_user $remote_ip $remote_port $root_password "chmod -R g-w root:www-data /etc/letsencrypt/live/$domain_name/privkey.pem" $log_file

# Configure Apache to auto-redirect to HTTPS
set apache_config_file "/etc/apache2/sites-available/$domain_name.conf"
set redirect_config "Redirect permanent / https://$domain_name/"

# Activate the Apache SSL configuration
execute_remote $root_user $remote_ip $remote_port $root_password "a2enmod ssl" $log_file

# Restart Apache to apply changes
execute_remote $root_user $remote_ip $remote_port $root_password "systemctl restart apache2" $log_file



# Copy Tmux config file
execute_remote $normal_user $remote_ip $remote_port $root_password "cp $tmux_config ~/" $log_file

# Create virtual env for Django backend

execute_remote $normal_user $remote_ip $remote_port $root_password "cd $django_folder && python3 -m venv env && source env/bin/activate && pip install -r requirements.txt" $log_file

# Set node 18.0 as default version
execute_remote $normal_user $remote_ip $remote_port $root_password "nvm alias default 18.0" $log_file

# Install each package dependencies
# Assuming a Makefile exists in the project root with an install target
execute_remote $normal_user $remote_ip $remote_port $root_password "cd $project_folder && make install" $log_file

execute_remote $root_user $remote_ip $remote_port $root_password "cp $project_folder/trading-bot-centralization-server/apache/centralization-server.conf /etc/apache2/sites-available/" $log_file
execute_remote $root_user $remote_ip $remote_port $root_password "cp $project_folder/trading-bot-centralization-server/apache/apache_ports.conf /etc/apache2/ports.conf" $log_file
# execute_remote $root_user $remote_ip $remote_port $root_password "cp $project_folder/trading-bot-backend/apache/backend-server-apache.conf /etc/apache2/sites-available" $log_file
execute_remote $root_user $remote_ip $remote_port $root_password "cp $project_folder/SimpleFrontEnd/desktop/apache/infinite-opportunities.pro.conf /etc/apache2/sites-available" $log_file
execute_remote $root_user $remote_ip $remote_port $root_password "sudo a2ensite centralization-server.conf" $log_file
execute_remote $root_user $remote_ip $remote_port $root_password "systemctl restart apache2" $log_file
execute_remote $normal_user $remote_ip $remote_port $root_password "cd $project_folder/trading-bot-centralization-server/trading-center && python manage.py collectstatic" $log_file


puts "Project setup completed."
