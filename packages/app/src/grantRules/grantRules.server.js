import get from 'lodash/get';

const rules = {
  'cabinet.access': () => {
    console.log('12312312312 cabinet.access');

    return true;
  },

  'requests.create': async function ({ user, userId, ...params }) {
    if (user.accountType === 'PREMIUN') return true;
    const { RequestModel } = this.app.models;
    const { help } = params;
    const requestsLimit = get(this, 'app.config.logic.requests.limit');
    if (!requestsLimit) return true;
    if (await RequestModel.count({ fromUserId: userId, help }) >= requestsLimit) return false;
    return true;
  },

  // 'events.create': async () => {
  //   if (user.accountType === 'PREMIUN') return true;
  //   const { EventModel } = this.app.models;
  //   const eventsLimit = get(this, 'app.config.logic.events.limit');
  //   if (!eventsLimit) return true;
  //   if (await EventModel.count({ userId }) >= eventsLimit) return false;
  //   return true;
  // },
  // 'default': () => false
};


export default rules;
