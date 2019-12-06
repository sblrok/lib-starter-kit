import { observable } from 'mobx';
// import set from 'lodash/set';
import CrudApi from '@lskjs/mobx/stores/CrudApi';
import CrudStore from '@lskjs/mobx/stores/CrudStore';

export class MessageApi extends CrudApi {
  base = '/api/messages';
}

export default uapp => class MesssageStore extends CrudStore {
  static api = new MessageApi({ uapp });

  // @observable videoId;
  // @observable appId;
};
