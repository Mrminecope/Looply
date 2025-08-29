#!/bin/bash
# LIA Clean Final Startup Script
# This script starts the clean LIA for Looply

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[LIA]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[LIA]${NC} $1"
}

print_error() {
    echo -e "${RED}[LIA]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[LIA]${NC} $1"
}

# Change to script directory
cd "$(dirname "$0")"

print_status "Starting LIA Clean Final - Looply Intelligent Assistant..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed or not in PATH"
    exit 1
fi

# Check Python version
python_version=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
required_version="3.6"
if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    print_error "Python 3.6+ is required. Current version: $python_version"
    exit 1
fi

print_info "Python version: $python_version ✓"
print_info "No external dependencies required - using Python standard library only"

# Check if configuration exists
if [ ! -f "lia_config.json" ]; then
    print_warning "Configuration file not found. Using defaults."
fi

print_status "Starting LIA Clean Final..."
print_info "Type 'exit' to quit LIA"
print_info ""

# Function to handle shutdown
cleanup() {
    print_warning "\nShutting down LIA Clean Final..."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start LIA in interactive mode
python3 lia_clean_final.py