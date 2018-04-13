#!/bin/sh
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
cd "$SCRIPTPATH"
echo "Working in \"$SCRIPTPATH\"..."

./cleanup.sh
./build-and-sign.sh
