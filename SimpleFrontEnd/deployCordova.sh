#!/bin/bash

export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
export PATH=/Users/beniben/Library/Android/sdk/build-tools/34.0.0:$PATH

# Check if ffmpeg is present
if command -v ffmpeg &>/dev/null; then
    # Loop through all mp4 files in ./desktop/src/assets
    for file in ./desktop/src/assets/*.mp4; do
        # Get the file name without the extension
        filename=$(basename -- "$file")
        name_no_ext="${filename%.*}"
        webm_file="./desktop/src/assets/$name_no_ext.webm"

        # Check if webm file does not exist, then convert
        if [[ ! -e $webm_file ]]; then
            ffmpeg -i "$file" -c:v libvpx -c:a libvorbis "$webm_file"
        fi
    done
else
    echo "ffmpeg is not installed or not found in PATH."
fi

cd desktop
quasar build -m cordova -T android
cd src-cordova
cordova run android
