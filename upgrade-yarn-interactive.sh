#!/bin/sh
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
cd "$SCRIPTPATH"
echo "Working in \"$SCRIPTPATH\"..."

yarn upgrade-interactive --latest

