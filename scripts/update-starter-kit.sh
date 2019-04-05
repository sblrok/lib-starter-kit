HOME='.'
rsync -avE --progress  ../analytics/ $HOME --exclude='*/'
rsync -avE --progress  ../analytics/scripts/* $HOME/scripts
