#!/usr/bin/env bash
# cp -R locales public/locales && \
# node -e "const str = require('fs').readFileSync('./public/index.html').toString(); console.log(str);"
# node -e "const str = require('fs').readFileSync('./public/index.html').toString(); const code = str.split('script>')[3]; console.log(code.substr(0, code.length - 2));" > public/chunks.js && \
node -e "const str = require('fs').readFileSync('./public/index.html').toString(); const code = str.split('<div id=\"root\"></div>')[1]; console.log(code.substr(0, code.length - '</body></html>'.length));" > public/footer.html
