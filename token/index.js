"use strict";

const jwt = require('jsonwebtoken');

class TokenStore {
  constructor(issuer, key) {
    this.issuer = issuer;
    this.key = key || {};
    this.token = null;
    if (this.issuer == null || this.key.pem == null || this.key.id == null) {
      throw new Error('Missing required parameters issuer & key');
    }
  }

  get(ttl=3000) {
    return this._cachedToken().catch(() => this._newToken(ttl))
  }

  _cachedToken() {
    return new Promise((resolve, reject) => {
      if (this.token == null) {
        return reject(new Error('no cached token'));
      }

      const claims = jwt.decode(this.token);
      const ttl = claims.exp - parseInt(Date.now() / 1000);
      if (ttl > 0) {
        resolve(this.token);
      } else {
        reject(new Error('Expired token'));
      }
    });
  }

  _newToken(expiresIn) {
    const key = this.key.pem;
    const options = {
      issuer: this.issuer,
      algorithm: 'ES256',
      expiresIn: expiresIn,
      header: {
        kid: this.key.id
      }
    };
    this.token = jwt.sign({}, key, options);
    return this.token;
  }
}

module.exports = TokenStore;
