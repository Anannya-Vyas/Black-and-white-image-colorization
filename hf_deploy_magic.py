import os
import getpass
from huggingface_hub import HfApi, create_repo
import sys

# Ensure ASCII output for older Windows terminals
def safe_print(msg):
    print(msg.encode('ascii', 'ignore').decode('ascii'))

def main():
    safe_print("--- AI Colorizer: Zero-Click Deployment ---")
    
    # 1. Get Token
    safe_print("\nStep 1: Authenticating")
    
    # Check if token is passed as argument or env var for automation
    token = os.environ.get("HF_TOKEN")
    if not token:
        # If running in a script, we need to handle the input
        # Note: getpass might hang if not in a proper TTY
        token = input("Please paste your Hugging Face WRITE token: ").strip()
    
    if not token.startswith("hf_"):
        safe_print("Error: That doesn't look like a valid Hugging Face token.")
        return

    try:
        api = HfApi(token=token)
        username = api.whoami()["name"]
        safe_print(f"Authenticated as: {username}")
    except Exception as e:
        safe_print(f"Authentication failed: {e}")
        return
    
    # 2. Setup Space
    space_id = f"{username}/ChromeAI-Colorize"
    
    safe_print(f"\nStep 2: Creating Space '{space_id}'...")
    try:
        create_repo(
            repo_id=space_id,
            repo_type="space",
            space_sdk="docker",
            token=token,
            exist_ok=True
        )
        safe_print("Space is ready.")
    except Exception as e:
        safe_print(f"Error creating space: {e}")
        return

    # 3. Define files to upload
    safe_print("\nStep 3: Preparing files for upload...")
    
    files_to_upload = [
        "app.py",
        "colorizer.py",
        "requirements.txt",
        "Dockerfile",
        "README.md",
        "COMPREHENSIVE_GUIDE.md"
    ]
    
    for file in files_to_upload:
        if os.path.exists(file):
            safe_print(f"Uploading {file}...")
            api.upload_file(
                path_or_fileobj=file,
                path_in_repo=file,
                repo_id=space_id,
                repo_type="space"
            )

    if os.path.exists("frontend/dist"):
        safe_print("Uploading website files (frontend/dist)...")
        api.upload_folder(
            folder_path="frontend/dist",
            path_in_repo="frontend/dist",
            repo_id=space_id,
            repo_type="space"
        )
    else:
        safe_print("Warning: frontend/dist not found.")

    safe_print("\n--- DEPLOYMENT STARTED! ---")
    safe_print(f"Your app will be live here in 2-3 minutes:")
    safe_print(f"https://huggingface.co/spaces/{space_id}")

if __name__ == "__main__":
    main()
