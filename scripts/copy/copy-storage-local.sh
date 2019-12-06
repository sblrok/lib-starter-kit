FOLDER=build/public/storage
rm -rf $FOLDER
mkdir $FOLDER
rsync -avz s3:/projects/hijay/storage/* $FOLDER
