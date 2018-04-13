#!/bin/sh
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
cd "$SCRIPTPATH"
echo "Working in \"$SCRIPTPATH\"..."

PROJECT="BLV DietCoach"
brew install gitstats
brew install gnuplot
brew install gource
brew install ffmpeg
rmdir -r stats
mkdir -p stats/web
gitstats -c project_name="$PROJECT" . ./stats/web
gource --date-format "%Y-%m-%d %H:%M:%S" --hide progress,mouse --title "$PROJECT" --auto-skip-seconds 1 --seconds-per-day 3 --file-idle-time 0 --camera-mode track -1280x720 -o - | ffmpeg -y -r 60 -f image2pipe -vcodec ppm -i - -vcodec libx264 -preset ultrafast -pix_fmt yuv420p -crf 1 -threads 0 -bf 0 "stats/$PROJECT.mp4"
