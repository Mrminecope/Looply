#!/usr/bin/env python3
"""
LIA Enhanced v3 Setup Script
Quick setup and installation for the Looply Intelligent Assistant backend
"""

import os
import sys
import subprocess
import platform

def print_status(message):
    print(f"🚀 {message}")

def print_error(message):
    print(f"❌ {message}")

def print_success(message):
    print(f"✅ {message}")

def run_command(command, description):
    """Run a command and return True if successful"""
    print_status(f"{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"Failed: {e}")
        if e.stdout:
            print(f"STDOUT: {e.stdout}")
        if e.stderr:
            print(f"STDERR: {e.stderr}")
        return False

def main():
    print_status("Setting up LIA Enhanced v3 Backend for Looply")
    print()
    
    # Check Python version
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print_error(f"Python 3.8+ required. Current version: {python_version.major}.{python_version.minor}")
        return False
    
    print_success(f"Python version: {python_version.major}.{python_version.minor}")
    
    # Determine Python command
    python_cmd = "python3" if platform.system() != "Windows" else "python"
    
    # Create virtual environment
    if not os.path.exists("lia_env"):
        if not run_command(f"{python_cmd} -m venv lia_env", "Creating virtual environment"):
            return False
        print_success("Virtual environment created")
    else:
        print_success("Virtual environment already exists")
    
    # Determine activation command
    if platform.system() == "Windows":
        activate_cmd = "lia_env\\Scripts\\activate && "
        python_venv = "lia_env\\Scripts\\python"
        pip_venv = "lia_env\\Scripts\\pip"
    else:
        activate_cmd = "source lia_env/bin/activate && "
        python_venv = "lia_env/bin/python"
        pip_venv = "lia_env/bin/pip"
    
    # Install dependencies
    if not run_command(f"{pip_venv} install -r requirements.txt", "Installing dependencies"):
        # Try minimal installation
        print_status("Trying minimal installation...")
        if not run_command(f"{pip_venv} install flask flask-cors", "Installing minimal dependencies"):
            return False
    
    print_success("Dependencies installed")
    
    # Test the installation
    print_status("Testing LIA installation...")
    test_cmd = f'{python_venv} -c "from lia_enhanced_lia import LIA; print(\\"LIA module loaded successfully\\")"'
    if run_command(test_cmd, "Testing LIA module"):
        print_success("LIA module test passed")
    else:
        print_error("LIA module test failed")
        return False
    
    # Create startup command
    startup_cmd = f"{python_venv} lia_enhanced_lia.py --api --port 5002"
    
    print()
    print_success("🎉 LIA Enhanced v3 setup complete!")
    print()
    print("📋 Next steps:")
    print("1. Start the LIA backend server:")
    print(f"   {startup_cmd}")
    print()
    print("2. Or use the startup scripts:")
    if platform.system() == "Windows":
        print("   start_lia.bat")
    else:
        print("   ./start_lia.sh")
    print()
    print("3. Test the server:")
    print("   curl http://localhost:5002/health")
    print()
    print("4. The frontend will automatically connect once the server is running!")
    
    # Ask if user wants to start the server now
    try:
        response = input("\nWould you like to start the LIA server now? (y/n): ").lower().strip()
        if response in ['y', 'yes']:
            print_status("Starting LIA server...")
            print("Press Ctrl+C to stop the server")
            subprocess.run(startup_cmd, shell=True)
    except KeyboardInterrupt:
        print("\n👋 Setup complete. Start the server when ready!")
    
    return True

if __name__ == "__main__":
    if main():
        sys.exit(0)
    else:
        sys.exit(1)