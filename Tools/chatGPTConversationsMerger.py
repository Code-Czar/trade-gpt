import json
import os
import tkinter as tk
from tkinter import filedialog
import zipfile


def parse_json_file(file_path):
    with open(file_path, "r") as file:
        data = json.load(file)
    return data


def split_long_string(string, max_length):
    return [string[i : i + max_length] for i in range(0, len(string), max_length)]


def process_message_content(parts):
    new_parts = []
    for part in parts:
        if isinstance(part, dict):
            part = part.get("text", "")  # Assuming 'text' key in the dictionary
        if isinstance(part, str):
            new_parts += part.split("\n")
    return new_parts


def extract_messages(data, max_line_length=80):
    messages = {}
    for msg_uuid, msg_data in data.items():
        if msg_data.get("message"):
            author = msg_data["message"]["author"]["role"]  # Ensure 'author' is defined
            parts = msg_data["message"]["content"].get("parts", [])
            message_content = process_message_content(parts)
            if any(len(part) > max_line_length for part in message_content):
                message_content = [
                    split_long_string(part, max_line_length) for part in message_content
                ]
            messages[msg_uuid] = {"from": author, "messageContent": message_content}
    return messages


def process_file(file_path, max_tokens):
    try:
        data = parse_json_file(file_path)

        if (
            isinstance(data, dict) and "title" in data
        ):  # Check for 'title' key in single conversation
            title = data["title"]
            messages = extract_messages(data["mapping"], max_tokens)
            yield title, {"title": title, "messages": messages}
        elif isinstance(data, list):  # Multiple conversations
            for conversation in data:
                if "title" in conversation:
                    title = conversation["title"]
                    messages = extract_messages(conversation["mapping"], max_tokens)
                    yield title, {"title": title, "messages": messages}
    except Exception as e:
        print(f"Error processing file {file_path}: {e}")


def create_zip_file(output_folder):
    zip_file_path = os.path.join(output_folder, "output.zip")
    with zipfile.ZipFile(zip_file_path, "w") as zipf:
        for root, dirs, files in os.walk(output_folder):
            for file in files:
                if file.endswith(".json"):
                    zipf.write(
                        os.path.join(root, file),
                        os.path.relpath(os.path.join(root, file), output_folder),
                    )
    print(f"All files zipped in {zip_file_path}")


def generate_output_files(input_folder, max_tokens):
    output_folder = os.path.join(input_folder, "out")
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for file_name in os.listdir(input_folder):
        if file_name.endswith(".json"):
            file_path = os.path.join(input_folder, file_name)
            for title, conversation in process_file(file_path, max_tokens):
                output_file_path = os.path.join(output_folder, f"{title}.json")
                with open(output_file_path, "w") as output_file:
                    json.dump(conversation, output_file, indent=4)
                print(f"Conversation '{title}' saved to {output_file_path}")

    create_zip_file(output_folder)


def select_folder():
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    initial_dir = os.path.expanduser(
        "~/Downloads"
    )  # Set initial directory to ~/Downloads
    folder_selected = filedialog.askdirectory(initialdir=initial_dir)
    root.destroy()
    return folder_selected


def main():
    max_tokens = 8000
    print("Select the input folder containing JSON files:")
    input_folder = select_folder()
    if input_folder:
        generate_output_files(input_folder, max_tokens)


if __name__ == "__main__":
    main()
