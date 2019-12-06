mkdir -p ~/dump/hijay-prod
rm -rf ~/dump/hijay-prod
mongodump \
  --host hijay.mgbeta.ru \
  --port 10008 \
  --db hijay \
  --username admin \
  --password ZKZkA898n7 \
  --out ~/dump/hijay-prod

ls -la ~/dump/hijay-prod/hijay/
cd ~/dump/hijay-prod/hijay/
for fi in *; do
  mv "$fi" _$fi
done
ls -la ~/dump/hijay-prod/hijay/

mongorestore \
  --host mongo.isuvorov.com \
  --port 27000 \
  # --db hijay_staging \
  --db hijay_master \
  --username hijay \
  --password "LhucqqkTBycuOSBbuV1w5Da3" \
  ~/dump/hijay-prod/hijay/ --drop