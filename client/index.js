const http2 = require('http2');

class Client {

  constructor(topic, environment = 'production') {
    this.host = environment == 'development' ? 'api.development.push.apple.com' : 'api.push.apple.com';
    this.topic = topic;
  }

  send(notification, device, token) {
    const path = `/3/device/${device}`;
    const options = {
      hostname: this.host,
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'apns-topic': this.topic
      }
    };
    return this._request(options, JSON.stringify(notification));
  }

  _request(options, body = null) {
    return new Promise((resolve, reject) => {
      const request = http2.request(options, response => {
        var data = [];
        response.on('data', chunk => data.push(chunk));
        response.on('end', () => resolve(data.join('')));
      });
      if (body != null) {
        request.write(body);
      }
      request.on('error', error => reject(error));
      request.end();
    });
  }
}

module.exports = Client;
