"use strict";

const fs = require('fs');
const APNS = require('../').APNS;

console.log(`Loading key from path ${process.env.APPLE_KEY_PATH}`);
const key = fs.readFileSync(process.env.APPLE_KEY_PATH);
console.log(`Loaded key ${key}`);

const apns = new APNS(process.env.APPLE_TEAM_ID, {id: process.env.APPLE_KID, pem: key});
const env = process.env.APPLE_ENV || 'development';
const notification = {
  aps: {
    alert: 'HTTP/2 APNS PUSH!'
  }
};
const device = process.argv[2];
apns
  .topic(process.env.APPLE_TOPIC, env)
  .send(notification, device)
  .then(response => {
    console.log(response);
    process.exit();
  }).catch(error => {
    console.error(error);
    process.exit();
  });
