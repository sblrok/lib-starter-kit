rm -rf packages/app/locales && \
node node_modules/@lskjs/build-locales/bin/build-locales --locales ru,en --link https://docs.google.com/spreadsheets/d/1pOG6jmCV81ITNk4M8jV8sxxs8RnjoYCjQjGCkTmlajk/edit#gid=0 --dist ./packages/app/locales && \
cp packages/app/locales/ru.json packages/app/locales/ru/translation.json && \
cp packages/app/locales/en.json packages/app/locales/en/translation.json && \
rm -rf packages/app/public/locales && \
cp -R packages/app/locales packages/app/public/locales
# npx @lskjs/build-locales --locales ru,en --link https://docs.google.com/spreadsheets/d/1_qVnTw1Cwb2Ziwta_N0p-V4_ptD6-ZypDvCIrnryNF/edit#gid=0 --dist ./locales