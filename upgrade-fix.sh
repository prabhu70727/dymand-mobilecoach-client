#!/bin/sh
cd ios/DietCoach.xcodeproj
cat project.pbxproj | sed '/<<<<<<< ours/,/=======/g' | grep -v '>>>>>>> theirs' | grep -v -e '^$' > project.pbxproj-new
rm project.pbxproj
mv project.pbxproj-new project.pbxproj
cd ../..

