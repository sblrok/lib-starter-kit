/* eslint-disable no-shadow */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */
const dir = process.cwd();
const assetManifestPath = `${dir}/public/asset-manifest.json`;
const manifest = require(assetManifestPath);

function getVendorName(manifest, ext = 'css') {
  const prefix = `static/${ext}/`;
  const vendorEntrypoints = manifest.entrypoints.filter(
    entrypoint =>
      entrypoint.startsWith(prefix) &&
      !(entrypoint.startsWith(`${prefix}main.`) || entrypoint.startsWith(`${prefix}runtime-main.`)),
  );
  if (vendorEntrypoints.length === 0) throw `!vendorEntrypoints ${ext}`;
  if (vendorEntrypoints.length === 2) {
    console.log({ vendorEntrypoints });
    throw `MULTIPLE vendorEntrypoints${ext}`;
  }
  const path = vendorEntrypoints[0];
  const filename = path.substr(prefix.length);
  return filename.substr(0, filename.length - ext.length - 1);
}
const vendorNameCss = `static/css/${getVendorName(manifest, 'css')}.css`;
const vendorNameJs = `static/js/${getVendorName(manifest, 'js')}.js`;

manifest.files['vendor.css'] = manifest.files[vendorNameCss];
manifest.files['vendor.js'] = manifest.files[vendorNameJs];
console.log(`LSK MODIFFY ASSET MANIFEST: ${assetManifestPath}`);
console.log(`files["vendor.css"] => ${manifest.files['vendor.css']}`);
console.log(`files["vendor.js"] => ${manifest.files['vendor.js']}`);
require('fs').writeFileSync(assetManifestPath, JSON.stringify(manifest));
