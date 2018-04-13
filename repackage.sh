#!/bin/sh
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
cd "$SCRIPTPATH"
echo "Working in \"$SCRIPTPATH\"..."

npm install react-native-rename -g
echo "Please insert the new package name (e.g. "com.pathmate.blv.foodtour"):"
read -e PACKAGE
echo "Please insert the new applcation name (e.g. "Food Tour"):"
read -e APP
echo "Are you sure to rename the app to $PACKAGE with name $APP? Answer with 'yes' to proceed:"
read -e ANSWER

if [ ! "$ANSWER" = "yes" ]
  then
  exit 0
fi

react-native-rename "$APP" -b $PACKAGE

echo "Clean watchman cache..."
watchman watch-del-all
echo ""
echo "Clean NPM cache...you have to manually stop packager after start. :-)"
echo ""
npm start --reset-cache

echo ""
echo "Don't forget to adjust the iOS setup accordingly by changing the package ($PACKAGE) and app name ($APP) inside Xcode!!!"
echo ""
echo "'./cleanup.sh hard' should be performed as well!"
echo ""
echo "Done."
