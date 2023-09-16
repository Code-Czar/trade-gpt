#!/bin/bash

# Configuration
NODE_VERSION="18.0.0"

# Ensure NVM is installed
if ! command -v nvm &> /dev/null; then
    echo "NVM is not found. Installing it now..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
    # Source the profile to make sure nvm command is available
    . ~/.nvm/nvm.sh
fi

# Use the desired Node version
echo "Switching to Node v$NODE_VERSION..."
nvm install $NODE_VERSION
nvm use $NODE_VERSION

# Ensure Quasar CLI is installed
if ! command -v quasar &> /dev/null; then
    echo "Quasar CLI is not found. Installing it now..."
    yarn global add @quasar/cli
fi

# Create a new Quasar project
echo "Creating a new Quasar project..."
yarn create quasar

cd desktop

# Create the unified directory structure
echo "Setting up the unified directory structure..."
mkdir -p src/{assets,components/{mobile,web},utils,store,router}

# Provide feedback
echo "Project setup complete! Navigate to the 'desktop' directory to start working on your project."
