"use strict";

require('dotenv').config();
const fs = require('fs');
const apns2 = require('../');
const Topic = apns2.Topic;
const Store = apns2.Token;

console.log(`Loading key from path ${process.env.APPLE_KEY_PATH}`);
const key = fs.readFileSync(process.env.APPLE_KEY_PATH);
console.log(`Loaded key ${key}`);

const store = new Store(process.env.APPLE_TEAM_ID, {id: process.env.APPLE_KID, pem: key});
const env = process.env.APPLE_ENV || 'development';
const topic = new Topic(process.env.APPLE_TOPIC, env);
store.get().then(token => {
  console.log(`Generated token ${token}`);
  const notification = {
    aps: {
      alert: 'HTTP/2 APNS PUSH!'
    }
  };
  const device = process.argv[2];
  return topic.send(notification, device, token);
}).then(response => {
  console.log(response);
  process.exit();
}).catch(error => {
  console.error(error);
  process.exit();
});
