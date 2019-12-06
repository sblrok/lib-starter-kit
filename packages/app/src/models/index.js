/* eslint-disable global-require */

export default (...args) => ({
  // ...require('@lskjs/mobx/stores').default,
  // ProfileModel: require('./ProfileModel').default(...args),
  RequestModel: require('./RequestModel').default(...args),
  UserModel: require('./UserModel').default(...args),
  MessageModel: require('./MessageModel').default(...args),
  IsicCardModel: require('./IsicCardModel').default(...args),
  ImageModel: require('./ImageModel').default(...args),
  ChatModel: require('./ChatModel').default(...args),
  MessageSocketModel: require('./MessageSocketModel').default(...args),
  // ProfileModel: require('./ProfileModel').default(...args),
  OptionsModel: require('./OptionsModel').default(...args),
  EventModel: require('./EventModel').default(...args),
  EventUserModel: require('./EventUserModel').default(...args),
  PurchaseModel: require('./PurchaseModel').default(...args),
});
