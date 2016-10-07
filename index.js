"use strict";

const Token = require('./token');
const Topic = require('./topic');
const APNSError = require('./error');

class APNS {
  constructor(teamId, key) {
    this.store = new Token(teamId, key);
  }

  topic(name, environment = 'production') {
    return {
      send: (notification, device) => {
        const topic = new Topic(name, environment);
        return this.store.get()
          .then(token => topic.send(notification, device, token));
      }
    };
  }
}

module.exports = {
  APNS,
  APNSError
};
