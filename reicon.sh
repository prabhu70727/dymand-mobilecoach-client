#!/bin/sh
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
cd "$SCRIPTPATH"
echo "Working in \"$SCRIPTPATH\"..."

rm -rf Icons
mkdir -p Icons

open Icons

echo "1) Drag your icon file (best quality) on Image2Icon with regular borders (not round) and confirm this step..."
read

echo "2) Export \"iOS\" to this folder and name it \"ios\"..."
read

echo "3) Export \"Iconset\" to this folder and name it \"iconset\" (Caution: Ensure to select \"iOS-Appiconset\" in the export window)..."
read

echo "4) Export \"Android\" to this folder and name it \"android\" (Caution: Ensure to select \"Extra -> Round Borders\" in the export window)..."
read

echo "5) Drag your NOTIFICATION icon file (best quality, white on transparent, with round borders) on Image2Icon and confirm this step..."
read

echo "6) Export \"Android\" to this folder and name it \"notification\" (Caution: Ensure NOT to select \"Extra -> Round Borders\" in the export window)..."
read

echo "Replacing iOS icons..."
cd ios
APPICONS="./ios/$(find . -type d -name 'AppIcon.appiconset')"
cd ..

cd "$APPICONS"
rm *.png
cp $SCRIPTPATH/Icons/iconset/icon.appiconset/*.png .
cp $SCRIPTPATH/Icons/ios/App\ Store.png App\ Store.png
cp $SCRIPTPATH/Icons/ios/App\ Store.png App\ Store-1.png
cp $SCRIPTPATH/Icons/ios/iPhone\ notification\ iOS\ 7\,11@2x.png iPhone\ notification\ iOS\ 7\,11@2x.png
cp $SCRIPTPATH/Icons/ios/iPhone\ notification\ iOS\ 7\,11@3x.png iPhone\ notification\ iOS\ 7\,11@3x.png
cp $SCRIPTPATH/Icons/ios/iPad\ notification\ iOS\ 7\,11.png iPad\ notification\ iOS\ 7\,11.png
cp $SCRIPTPATH/Icons/ios/iPad\ notification\ iOS\ 7\,11@2x.png iPad\ notification\ iOS\ 7\,11@2x.png

cd "$SCRIPTPATH"

echo "Replacing Android icons..."
cd "$SCRIPTPATH/android/app/src/main/res"
cp $SCRIPTPATH/Icons/android/icon_mdpi.png drawable-ldpi/ic_launcher.png
cp $SCRIPTPATH/Icons/android/icon_mdpi.png drawable-mdpi/ic_launcher.png
cp $SCRIPTPATH/Icons/android/icon_hdpi.png drawable-hdpi/ic_launcher.png
cp $SCRIPTPATH/Icons/android/icon_xhdpi.png drawable-xhdpi/ic_launcher.png
cp $SCRIPTPATH/Icons/android/icon_xxhdpi.png drawable-xxhdpi/ic_launcher.png
cp $SCRIPTPATH/Icons/android/icon_xxxhdpi.png drawable-xxxhdpi/ic_launcher.png
cp $SCRIPTPATH/Icons/android/icon_mdpi.png mipmap-ldpi/ic_launcher.png
cp $SCRIPTPATH/Icons/android/icon_mdpi.png mipmap-mdpi/ic_launcher.png
cp $SCRIPTPATH/Icons/android/icon_hdpi.png mipmap-hdpi/ic_launcher.png
cp $SCRIPTPATH/Icons/android/icon_xhdpi.png mipmap-xhdpi/ic_launcher.png
cp $SCRIPTPATH/Icons/android/icon_xxhdpi.png mipmap-xxhdpi/ic_launcher.png
cp $SCRIPTPATH/Icons/android/icon_xxxhdpi.png mipmap-xxxhdpi/ic_launcher.png

cp $SCRIPTPATH/Icons/notification/icon_mdpi.png drawable-ldpi/ic_notification.png
cp $SCRIPTPATH/Icons/notification/icon_mdpi.png drawable-mdpi/ic_notification.png
cp $SCRIPTPATH/Icons/notification/icon_hdpi.png drawable-hdpi/ic_notification.png
cp $SCRIPTPATH/Icons/notification/icon_xhdpi.png drawable-xhdpi/ic_notification.png
cp $SCRIPTPATH/Icons/notification/icon_xxhdpi.png drawable-xxhdpi/ic_notification.png
cp $SCRIPTPATH/Icons/notification/icon_xxxhdpi.png drawable-xxxhdpi/ic_notification.png
cp $SCRIPTPATH/Icons/notification/icon_mdpi.png mipmap-ldpi/ic_notification.png
cp $SCRIPTPATH/Icons/notification/icon_mdpi.png mipmap-mdpi/ic_notification.png
cp $SCRIPTPATH/Icons/notification/icon_hdpi.png mipmap-hdpi/ic_notification.png
cp $SCRIPTPATH/Icons/notification/icon_xhdpi.png mipmap-xhdpi/ic_notification.png
cp $SCRIPTPATH/Icons/notification/icon_xxhdpi.png mipmap-xxhdpi/ic_notification.png
cp $SCRIPTPATH/Icons/notification/icon_xxxhdpi.png mipmap-xxxhdpi/ic_notification.png

cd "$SCRIPTPATH"

cp $SCRIPTPATH/Icons/android/play_store.png android/play_store.png

mkdir -p Icons_Archive
cp -R Icons/* Icons_Archive
rm -rf Icons

rm Icons_Archive/ios/Icon?
rm Icons_Archive/android/Icon?
rm Icons_Archive/notification/Icon?

echo "Done."
