# apns.js

Apple APNS API v3 client (HTTP/2)

## Requirements

Node ~> 6

## Installation

```bash
npm install auth0-apns
```

## Usage

Fist create your `APNS` instance, and avoid recreating it every time since it will cache the APNS token according to Apple Guidelines

```js
const APNS = require('auth0-apns').APNS;
const apns = new APNS('{YOUR_APPLE_TEAM_IDENTIFIER}', { id: '{YOUR_APPLE_APN_KEY_ID}', pem: '{YOUR_APPLE_APN_KEY}'});
```

Then to send the notification you need to:

```js
const notification = {
  aps: { alert: 'A notification sent from apns.js' }
};
apns
  .topic('{APNS_TOPIC}')
  .send(notification, '{DEVICE_TOKEN}')
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

### Parameters

- APN Key: In order to send a push notification you need an APN key that can be generated and downloaded from the [developer portal](https://developer.apple.com/account/ios/certificate/key). With this key you will be able to send a push notification to any of your apps signed by your Apple developer team.
- APN Key identifier: The identifier of the APN Key generated from the [developer portal](https://developer.apple.com/account/ios/certificate/key).
- Apple Team identifier: Id of your Apple developer account, it can be found in [developer portal](https://developer.apple.com/account/#/membership/).
- APNS Topic: topic of the remote push notification which is usually your application bundle identifier.
- Device Token: Token obtained by the iOS Application in a device

> For more info on these values please check https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/ApplePushService.html#//apple_ref/doc/uid/TP40008194-CH100-SW9

### Environments

By default apns.js uses the `production` endpoint but you can easily change it when building the topic:

```js
const APNS = require('auth0-apns').APNS;
const apns = new APNS('{YOUR_APPLE_TEAM_IDENTIFIER}', { id: '{YOUR_APPLE_APN_KEY_ID}', pem: '{YOUR_APPLE_APN_KEY}'});
apns
  .topic('{APNS_TOPIC}', 'development')
```

### Errors

If APNS API returns an error, apns.js will wrap in [APNSError](https://github.com/auth0/apns.js/blob/master/error/index.js) class, where the name will hold the `reason` code for the failure.

Also all possible reasons are declared in `APNS.Reasons.{Error}`

```js
const APNSError = require('auth0-apns').APNSError;
console.log(APNSError.Reasons.BadCollapseId.name);
console.log(APNSError.Reasons.BadCollapseId.message);
```

so you could check the errors like

```js
apns
  .topic('{APNS_TOPIC}')
  .send(notification, '{DEVICE_TOKEN}')
  .then(response => console.log(response))
  .catch(error => {
    if (error.name == APNSError.Reasons.Unregistered.name) {
      console.log('User unregisteded decice from APNS');
    } else {
      console.error(error);
    }
  });
```
## What is Auth0?

Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, amont others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
* Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
* Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
* Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
* Analytics of how, when and where users are logging in.
* Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free Auth0 Account

1. Go to [Auth0](https://auth0.com) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE.txt) file for more info.
