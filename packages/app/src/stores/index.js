
export default function () {
  return {
    ...require('@lskjs/mobx/stores').default,
    MessageStore: require('./MessageStore').default(...arguments),
  };
}
