import fallback from './fallback';

export default ({ fallback: asset, url } = {}) => async function (req, res) {
  if (__DEV__ && url) {
    return fallback({ url, req });
  }
  return res.set({ 'content-type': 'image/png' }).send(require('fs').readFileSync(asset));
};
