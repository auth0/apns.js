'use strict';

class APNSError extends Error {
  constructor (status, data) {
    super();
    Error.captureStackTrace(this, this.constructor);
    const reason = APNSError.Reasons[data.reason] || {};
    this.name = reason.name || 'UnknownError';
    this.message = reason.message || 'Failed to contact APNS API';
    this.data = data || {};
  }

  static get Reasons() {
    return {
      BadCollapseId: { name: 'BadCollapseId', message: 'The collapse identifier exceeds the maximum allowed size' },
      BadDeviceToken: { name: 'BadDeviceToken', message: 'he specified device token was bad. Verify that the request contains a valid token and that the token matches the environment' },
      BadExpirationDate: { name: 'BadExpirationDate', message: 'The apns-expiration value is bad' },
      BadMessageId: { name: 'BadMessageId', message: 'The apns-id value is bad' },
      BadPriority: { name: 'BadPriority', message: 'The apns-priority value is bad' },
      BadTopic: { name: 'BadTopic', message: 'The apns-topic was invalid' },
      DeviceTokenNotForTopic: { name: 'DeviceTokenNotForTopic', message: 'The device token does not match the specified topic' },
      DuplicateHeaders: { name: 'DuplicateHeaders', message: 'One or more headers were repeated' },
      IdleTimeout: { name: 'IdleTimeout', message: 'Idle timeout' },
      MissingDeviceToken: { name: 'MissingDeviceToken', message: 'The device token is not specified in the request :path. Verify that the :path header contains the device token' },
      MissingTopic: { name: 'MissingTopic', message: 'The apns-topic header of the request was not specified and was required. The apns-topic header is mandatory when the client is connected using a certificate that supports multiple topics' },
      PayloadEmpty: { name: 'PayloadEmpty', message: 'The message payload was empty' },
      TopicDisallowed: { name: 'TopicDisallowed', message: 'Pushing to this topic is not allowed' },
      BadCertificate: { name: 'BadCertificate', message: 'The certificate was bad' },
      BadCertificateEnvironment: { name: 'BadCertificateEnvironment', message: 'The client certificate was for the wrong environment' },
      ExpiredProviderToken: { name: 'ExpiredProviderToken', message: 'The provider token is stale and a new token should be generated' },
      Forbidden: { name: 'Forbidden', message: 'The specified action is not allowed' },
      InvalidProviderToken: { name: 'InvalidProviderToken', message: 'The provider token is not valid or the token signature could not be verified' },
      MissingProviderToken: { name: 'MissingProviderToken', message: 'No provider certificate was used to connect to APNs and Authorization header was missing or no provider token was specified' },
      BadPath: { name: 'BadPath', message: 'The request contained a bad :path value' },
      MethodNotAllowed: { name: 'MethodNotAllowed', message: 'The specified :method was not POST' },
      Unregistered: { name: 'Unregistered', message: 'The device token is inactive for the specified topic' },
      PayloadTooLarge: { name: 'PayloadTooLarge', message: 'The message payload was too large' },
      TooManyProviderTokenUpdates: { name: 'TooManyProviderTokenUpdates', message: 'The provider token is being updated too often' },
      TooManyRequests: { name: 'TooManyRequests', message: 'Too many requests were made consecutively to the same device token' },
      InternalServerError: { name: 'InternalServerError', message: 'An internal server error occurred' },
      ServiceUnavailable: { name: 'ServiceUnavailable', message: 'The service is unavailable' },
      Shutdown: { name: 'Shutdown', message: 'The server is shutting down' }
    };
  }
}

module.exports = APNSError;
