import ServerApp from '@lskjs/server';

export default class App extends ServerApp {
  async init() {
    super.init();
    console.log('Fucking init');
  }
  getModels() {
    return {};
  }
  async run() {
    super.run();
    console.log('Fucking run');
  }
}
