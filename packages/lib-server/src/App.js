import ServerApp from '@lskjs/server';

export default class App extends ServerApp {
  async init() {
    await super.init();
    console.log('Fucking init');
  }
  getModels() {
    return {};
  }
  async run() {
    await super.run();
    console.log('Fucking run');
  }
}
