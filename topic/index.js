const http2 = require('http2');
const APNSError = require('../error');

class Topic {

  constructor(name, environment = 'production') {
    if (name == null) {
      throw new Error('missing topic name');
    }
    this._host = environment == 'development' ? 'api.development.push.apple.com' : 'api.push.apple.com';
    this._name = name;
  }

  get name() {
    return this._name;
  }

  get host() {
    return this._host;
  }

  send(notification, device, token) {
    if (notification == null || device == null || token == null) {
      return Promise.reject(new Error('must provide a notification, device and token'));
    }
    const path = `/3/device/${device}`;
    const options = {
      hostname: this.host,
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'apns-topic': this.name
      }
    };
    return this._request(options, JSON.stringify(notification))
      .then(response => {
        if (response.status == 200) {
          return {id: response.headers['apns-id']};
        }
        throw new APNSError(response.status, JSON.parse(response.data));
      });
  }

  _request(options, body = null) {
    return new Promise((resolve, reject) => {
      const request = http2.request(options, response => {
        var data = [];
        response.on('data', chunk => data.push(chunk));
        response.on('end', () => {
          let value = {
            status: response.statusCode,
            headers: response.headers,
           };
          if (data.length > 0) {
            value['data'] = data.join('');
          }
          resolve(value);
        });
      });
      if (body != null) {
        request.write(body);
      }
      request.on('error', error => reject(error));
      request.end();
    });
  }
}

module.exports = Topic;
