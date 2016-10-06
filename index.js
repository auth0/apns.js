"use strict";

require('dotenv').config();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const http2 = require('http2');

console.log(`Loading key from path ${process.env.APPLE_KEY_PATH}`);
const key = fs.readFileSync(process.env.APPLE_KEY_PATH);
console.log(`Loaded key ${key}`);

const options = {
  issuer: process.env.APPLE_TEAM_ID,
  algorithm: 'ES256',
  expiresIn: '50m',
  header: {
    kid: process.env.APPLE_KID
  }
};

const token = jwt.sign({}, key, options);

console.log(`Generated token ${token}`);

const deviceToken = process.argv[2];
const path = `/3/device/${deviceToken}`;

const env = process.env.APPLE_ENV || 'development';
const payload = {
  hostname: env == 'development' ? 'api.development.push.apple.com' : 'api.push.apple.com',
  port: 443,
  path: path,
  method: 'POST',
  headers: {
    authorization: `Bearer ${token}`,
    'apns-topic': process.env.APPLE_TOPIC
  }
}

const request = http2.request(payload, response => response.pipe(process.stdout));
request.write(JSON.stringify({
  aps: {
    alert: 'HTTP/2 APNS PUSH!'
  }
}));
request.end();
