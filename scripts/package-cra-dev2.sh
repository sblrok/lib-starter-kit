#!/usr/bin/env bash
# //  -rki
rm -rf ./.locks* && \
../../node_modules/concurrently/bin/concurrently.js  \
   " \
      echo \"🎃 Starting 'npm run watch' and waiting....\" && \
      npm run watch \
   " \
   " \
       ../../node_modules/wait-on/bin/wait-on Successfully compiled && \
       echo \"🎃 Starting CRA 'npm start' and waiting....\" \
       rm -rf cra/build && \
       rm -rf cra/src && \
       cd cra && \
       ln -s ../build src && \
       SKIP_PREFLIGHT_CHECK=true npm start \
   " \
   " \
      ../../node_modules/wait-on/bin/wait-on Successfully compiled && \
       echo \"🎃 Starting CRA 'npm run server:dev' and waiting....\" \
      npm run server:dev \
   " \
   " \
      ../../node_modules/wait-on/bin/wait-on asd123 && \
      echo \"🎃 YAAAAAAAAHOOOOOOO!\" \
   " \
   " \
      sleep 2 && \
      echo \"asd123\" && \
      sleep 20 \
   "
cd ../..