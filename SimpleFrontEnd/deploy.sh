#!/bin/bash 

export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
export PATH=/Users/beniben/Library/Android/sdk/build-tools/34.0.0:$PATH

cd desktop

if [ "$1" == "debug" ]; then
    releasePath="./dist/capacitor/android/apk/debug/app-debug.apk"
    quasar build --debug -m capacitor -T android
else
    releasePath="./dist/capacitor/android/apk/release/app-release-unsigned.apk"
    # quasar build -m capacitor -T android
    quasar build -m cordova -T android

    apksigner sign --ks opportunities.keystore --out Opportunities.apk $releasePath
fi



adb install Opportunities.apk