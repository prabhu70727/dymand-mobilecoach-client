#!/bin/sh
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
cd "$SCRIPTPATH"
echo "Working in \"$SCRIPTPATH\"..."

cd ios
rm -rf `find . -type f -name .\*`
cd ..

cd Web
rm -rf `find . -type f -name .\*`
cd ..

rm -rf `find . -type f -name .DS_Store`

