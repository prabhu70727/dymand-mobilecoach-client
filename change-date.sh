#!/bin/sh
echo "Setting to ${1}.${2}. at 12:00"
adb shell "su 0 toybox date ${2}${1}12002018.00"
