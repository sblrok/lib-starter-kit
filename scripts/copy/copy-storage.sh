FOLDER=storage
sh get_storage.sh
rsync -avz $FOLDER hijay:/projects/hijay/
