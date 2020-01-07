import IndexApi from './IndexApi';

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
  return {
    '/': getTemplate,
    '/sonya': getTemplate,
    '/yukioru': getTemplate,

    '/api': new IndexApi(this),
    '/storage/*': async () => {
      // TODO: МАПИНГ СТАТИКИ С ПРОДА ПОСМОТРЕТЬ КАК У ХАЙДЖЕЯ
      //
    },
    '/assets': { '*': () => ({ err: '!!!! route' }) }, // TODO: ПОДУМАТЬ
    '*': async this.reactApp.render,;
    },
  };
}
