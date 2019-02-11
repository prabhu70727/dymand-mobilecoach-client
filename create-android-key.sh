#!/bin/sh
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
cd "$SCRIPTPATH"
echo "Working in \"$SCRIPTPATH\"..."

echo "Please enter the project identifier (e.g. mobilecoach-whatever):"
read -e PACKAGE

echo ""
echo "Please enter the certificate information..."
echo "...and confirm to use the same password for the certificate as for the keystore"
echo

keytool -genkey -v -keystore ../Keys/$PACKAGE-android-release-key.keystore -alias $PACKAGE -keyalg RSA -keysize 2048 -validity 10000
