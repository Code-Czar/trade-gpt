import tkinter as tk
from tkinter import filedialog, messagebox
import subprocess
import json
import os
import threading
import queue


def load_config():
    config_path = os.path.join(
        os.path.dirname(__file__), "../Shared/src/consts/config_remote.json"
    )
    with open(config_path, "r") as file:
        return json.load(file)


# Queue for tasks and worker thread
task_queue = queue.Queue()


def worker():
    while True:
        script_name, args, interpreter = task_queue.get()
        try:
            process = subprocess.Popen([interpreter, script_name] + args)

            tk.messagebox.showinfo(
                "Success", f"Script {script_name} executed successfully!"
            )
        except subprocess.CalledProcessError as e:
            tk.messagebox.showerror("Error", f"Error executing {script_name}: {e}")
        task_queue.task_done()


def execute_bash_script(script_name, args, interpreter="bash"):
    task_queue.put((script_name, args, interpreter))


def select_public_key_files():
    initial_dir = os.path.expanduser("~/.ssh")
    file_paths = filedialog.askopenfilenames(
        title="Select Public Key Files", initialdir=initial_dir
    )
    public_key_files.set(",".join(file_paths))


def submit():
    remote_ip = ip_var.get()
    remote_port = entry_remote_port.get()
    root_password = entry_root_password.get()
    normal_user = entry_normal_user.get()
    op_dev_user_password = entry_op_dev_user_password.get()
    domain_name = entry_domain_name.get()
    key_files = public_key_files.get()
    current_folder = entry_current_folder.get()

    # Debugging: Print the arguments to be passed
    print("Running 'copy_project.sh' with arguments:")
    print(
        f"root_user: root, normal_user: {normal_user}, remote_ip: {remote_ip}, remote_port: {remote_port}, "
    )
    print(
        f"root_password: {root_password}, domain_name: {domain_name}, key_files: {key_files}, current_folder: {current_folder}"
    )

    # Execute scripts with domain name as an additional argument
    execute_bash_script(
        "initial_setup.sh",
        [
            "root",
            remote_ip,
            remote_port,
            root_password,
            op_dev_user_password,
            key_files,
            current_folder,
        ],
        "expect",
    )
    execute_bash_script(
        "install_dependencies.sh",
        [
            "root",
            normal_user,
            remote_ip,
            remote_port,
            root_password,
            op_dev_user_password,
            key_files,
            current_folder,
        ],
        "expect",
    )
    execute_bash_script(
        "copy_project.sh",
        [
            "root",
            normal_user,
            remote_ip,
            remote_port,
            root_password,
            domain_name,
            key_files,
            current_folder,
        ],
        "bash",
    )
    execute_bash_script(
        "install_project.sh",
        [
            "root",
            normal_user,
            remote_ip,
            remote_port,
            root_password,
            domain_name,
            key_files,
            current_folder,
        ],
        "expect",
    )


config = load_config()

root = tk.Tk()
root.title("Server Configuration")

frame = tk.Frame(root)
frame.pack(padx=10, pady=10)

# Dropdown for selecting IP
ip_var = tk.StringVar(value=list(config.values())[0])  # Set the first value as default
ip_dropdown = tk.OptionMenu(frame, ip_var, *config.values())
tk.Label(frame, text="Select IP:").grid(row=0, column=0, sticky="w")
ip_dropdown.grid(row=0, column=1)


# Fields for remote port
entry_remote_port = tk.Entry(frame)
entry_remote_port.insert(0, "22")  # Default SSH port
entry_remote_port.grid(row=1, column=1)
tk.Label(frame, text="SSH Port:").grid(row=1, column=0, sticky="w")

# Field for root password
entry_root_password = tk.Entry(frame, show="*")
entry_root_password.grid(row=2, column=1)
tk.Label(frame, text="Root Password:").grid(row=2, column=0, sticky="w")

# Field for normal user name
entry_normal_user = tk.Entry(frame)
entry_normal_user.insert(0, "opDevUser")  # Set default value to opDevUser
entry_normal_user.grid(row=3, column=1)
tk.Label(frame, text="Normal User Name:").grid(row=3, column=0, sticky="w")

# Field for opDevUser password
entry_op_dev_user_password = tk.Entry(frame, show="*")
entry_op_dev_user_password.grid(row=4, column=1)
tk.Label(frame, text="opDevUser Password:").grid(row=4, column=0, sticky="w")

# Field for current folder
entry_current_folder = tk.Entry(frame)
entry_current_folder.grid(row=5, column=1)
tk.Label(frame, text="Current Folder:").grid(row=5, column=0, sticky="w")

# Field for domain name
entry_domain_name = tk.Entry(frame)
entry_domain_name.insert(0, "infinite-opportunities.pro")
entry_domain_name.grid(row=6, column=1)
tk.Label(frame, text="Domain Name:").grid(row=6, column=0, sticky="w")

# Button for selecting public key files
public_key_files = tk.StringVar()
btn_select_keys = tk.Button(
    frame, text="Select Public Key Files", command=select_public_key_files
)
btn_select_keys.grid(row=7, column=0, columnspan=2)


# Submit button
submit_button = tk.Button(frame, text="Submit", command=submit)
submit_button.grid(row=8, column=0, columnspan=2)

# Start the worker thread
threading.Thread(target=worker, daemon=True).start()

root.mainloop()
