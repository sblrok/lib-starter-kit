import get from 'lodash/get';

export default class Grant {
  constructor(params = {}) {
    Object.assign(this, params);
  }
  getParams(args) {
    if (args.length === 1) {
      const [params = {}] = args;
      if (typeof params === 'string') {
        return { action: params };
      }
      return params;
    }
    const [userOrId, action, params = {}] = args;
    let user;
    let userId;
    if (typeof userOrId === 'string') {
      userId = userOrId;
    } else {
      user = userOrId;
      userId = userOrId._id;
    }
    return {
      user,
      userId,
      action,
      ...params,
    };
  }


  async can(...args) {
    const params = this.getParams(args);
    const { action } = params;
    let user;
    let userId;

    if (params.user) {
      ({ user } = params);
      userId = user._id;
    } else if (params.userId) {
      ({ userId } = params);
      const { UserModel } = this.app.models;
      user = await UserModel.findById(params.userId);
    } else {
      user = null;
    }
    if (action === 'requests.create') {
      if (user.accountType === 'PREMIUN') return true;
      const { RequestModel } = this.app.models;
      const { help } = params;
      const requestsLimit = get(this, 'app.config.logic.requests.limit');
      if (!requestsLimit) return true;
      if (await RequestModel.count({ fromUserId: userId, help }) >= requestsLimit) return false;
      return true;
    }
    if (action === 'events.create') {
      if (user.accountType === 'PREMIUN') return true;
      const { EventModel } = this.app.models;
      const eventsLimit = get(this, 'app.config.logic.events.limit');
      if (!eventsLimit) return true;
      if (await EventModel.count({ userId }) >= eventsLimit) return false;
      return true;
    }
    return false;
  }
}
