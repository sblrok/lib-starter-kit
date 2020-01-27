import IndexApi from './IndexApi';
import createFallback from '../lskjs/server/createFallback';

const getTemplate = (req, res) => {
  try {
    const str = require('fs').readFileSync(`${process.cwd()}/../public/template.html`).toString();
    return res.send(str);
  } catch (err) {
    const str = require('fs').readFileSync(`${process.cwd()}/public/template.html`).toString();
    return res.send(str);
  }
  // require('fs').readFileSync(`${process.cwd()}/packages/app/public/index.html`).toString();

  return 'asdasdas';
};


export default function () {
  const fallback = createFallback({
    url: __DEV__ ? this.config.fallbackUrl : null,
    fallback: `${process.cwd()}/public/assets/no-avatar.png`,
  });
  return {
    '/': getTemplate,
    '/sonya': getTemplate,
    '/yukioru': getTemplate,
    '/api': new IndexApi(this),
    '/storage/*': fallback,
    '/assets/*': fallback,
    '*': this.reactApp.render,
  };
}
