#!/bin/sh
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
cd "$SCRIPTPATH"
echo "Working in \"$SCRIPTPATH\"..."

brew install imagemagick

echo "Enter new color code in format #RRGGBB:"
read -e COLOR

find . -type f -name 'Default*.png' -print0 | while IFS= read -r -d $'\0' line; do
     convert "$line" -fuzz 15% -fill "$COLOR" -colorize 100% "$line"
done
find . -type f -name 'screen.png' -print0 | while IFS= read -r -d $'\0' line; do
     convert "$line" -fuzz 15% -fill "$COLOR" -colorize 100% "$line"
done

echo "Done."
