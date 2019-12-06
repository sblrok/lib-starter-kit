import IndexApi from './IndexApi';

export default function () {
  return {
    '/api': new IndexApi(this),
    '/storage/*': async () => {
      // TODO: МАПИНГ СТАТИКИ С ПРОДА ПОСМОТРЕТЬ КАК У ХАЙДЖЕЯ
      //
    },
    '/assets': { '*': () => ({ err: '!!!! route' }) }, // TODO: ПОДУМАТЬ
    '*': async (req, ...args) => {
      req.url = req.originalUrl;
      await this.reactApp.render(req, ...args);
    },
  };
}
