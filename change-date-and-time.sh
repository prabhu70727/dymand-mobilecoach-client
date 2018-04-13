#!/bin/sh
echo "Setting to ${1}.${2}. at ${3}:${4}"
adb shell "su 0 toybox date ${2}${1}${3}${4}2018.00"
