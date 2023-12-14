#!/usr/bin/expect -f

# Define the log file path
set log_file "post_install.log"

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

# Disable root login 
puts "Post installation completed."
