/* eslint-disable global-require */
export default function getDocs() {
  const { title, desciption } = this.app.config.about || {};
  const url = this.app.url('/api/v5');
  const { port } = this.app.config;
  const [schema2, , hostname, ...path] = url.split('/');
  const schema = schema2.substr(0, schema2.length - 1);
  const [host2] = hostname.split(':');
  // const host = hostname;
  const host = __DEV__ ? `${host2}:${port}` : hostname;
  const basePath = `/${path.join('/')}`;
  // const host = this.app.url('/api/v5');
  // const schema = host.split('://')[0];
  // const basePath = '/v5';

  return {
    swagger: '2.0',
    info: {
      title,
      desciption,
      version: '1.0.0',
    },
    host,
    schemes: [
      schema,
    ],
    basePath,
    produces: ['application/json'],
    paths: {
      ...require('./api/admin').default,
      ...require('./api/auth').default,
      ...require('./api/usersMe').default,
    },
    definitions: require('./definitions').default,
  };
}
