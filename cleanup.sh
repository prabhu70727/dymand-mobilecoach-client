#!/bin/sh
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
cd "$SCRIPTPATH"
echo "Working in \"$SCRIPTPATH\"..."

if [ "$1" = 'hard' ]
then
  echo "Clean yarn cache..."
	yarn cache clean
fi

echo "Cleaning builds..."
rm -R -f ios/build
rm -R -f android/build

#echo "Updating React Native setup itself..."
#echo " "
#echo "     CONFIRM ALL WITH \"y\"!!!!!!"
#echo " "
#react-native upgrade

echo "Updating dependencies..."
#rm -f yarn.lock
rm -f package-lock.json
rm -R -f node_modules
yarn install

echo "Correcting iOS/Android setups..."
react-native link
cd android/app/src/main/assets
rm web
ln -s ../../../../../Web/ web
cd "$SCRIPTPATH"

echo "Hacks to prevent specific errors..."
rm ./node_modules/react-native/local-cli/core/__fixtures__/files/package.json

if [ "$1" = 'hard' ]
then
  echo "Clean watchman cache..."
	watchman watch-del-all
  echo ""
  echo "Clean NPM cache...you have to manually stop packager after start. :-)"
  echo ""
  npm start --reset-cache
fi
