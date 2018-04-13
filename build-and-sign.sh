#!/bin/sh
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
cd "$SCRIPTPATH"
echo "Working in \"$SCRIPTPATH\"..."

cd android && ./gradlew assembleRelease
cd ..
echo "See apk in android/app/build/outputs/apk/"
open android/app/build/outputs/apk/
