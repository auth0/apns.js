"use strict";

const fs = require('fs');
const jwt = require('jsonwebtoken');

const loadKey = (path) => {
  console.log(`Loading key from path ${path}`);
  const key = fs.readFileSync(path);
  console.log(`Loaded key ${key}`);
  return key;
};

class TokenStore {
  constructor(issuer, key) {
    this.issuer = issuer;
    this.key = key || {};
    this.token = null;
    if (this.issuer == null || this.key.path == null || this.key.id == null) {
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
    const key = loadKey(this.key.path);
    const options = {
      issuer: this.issuer,
      algorithm: 'ES256',
      expiresIn: expiresIn,
      header: {
        kid: this.key.id
      }
    };
    this.token = jwt.sign({}, key, options);
    console.log(`Generated token ${this.token}`);
    return this.token;
  }
};

module.exports = TokenStore;
