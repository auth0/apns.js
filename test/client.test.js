`use strict`;

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const faker = require('faker');

const Client = require('../client');

describe('client', function() {

  const token = faker.random.uuid();
  const device = faker.random.uuid();
  const notification = {aps:{alert:faker.random.word()}};

  describe('#constructor', function() {

    it('should create with topic for production', function() {
      const client = new Client('com.auth0.sample.APNS', 'production');
      expect(client.topic).to.be.equal('com.auth0.sample.APNS');
      expect(client.host).to.be.equal('api.push.apple.com');
    });

    it('should create with topic for development', function() {
      const client = new Client('com.auth0.sample.APNS', 'development');
      expect(client.topic).to.be.equal('com.auth0.sample.APNS');
      expect(client.host).to.be.equal('api.development.push.apple.com');
    });

    it('should create with topic only', function() {
      const client = new Client('com.auth0.sample.APNS');
      expect(client.topic).to.be.equal('com.auth0.sample.APNS');
      expect(client.host).to.be.equal('api.push.apple.com');
    });

    it('should fail to build with no topic', function() {
      expect(() => new Client()).to.throw(Error);
    });

  });

  describe('#send', function() {

    const topic = 'com.auth0.sample.apns';
    var client;

    beforeEach(function() {
      client = new Client(topic);
      client._request = () => { throw new Error('MOCKED!') };
    });

    describe('validations', function() {
      it('should fail with no parameters', function() {
        return expect(client.send()).to.be.rejected;
      });

      it('should fail with only notification', function() {
        return expect(client.send(notification)).to.be.rejected;
      });

      it('should fail without token', function() {
        return expect(client.send(notification, device)).to.be.rejected;
      });

      it('should fail with null notification', function() {
        return expect(client.send(null, device, token)).to.be.rejected;
      });

      it('should fail with null device', function() {
        return expect(client.send(notification, null, token)).to.be.rejected;
      });

      it('should fail with null token', function() {
        return expect(client.send(notification, device, null)).to.be.rejected;
      });
    });

    describe('request', function() {

      var options, body;

      const send = () => client.send(notification, device, token);

      beforeEach(function() {
        options = {};
        body = null;
        client._request = (opts, payload) => {
          options = opts;
          body = payload;
          return Promise.resolve("{}");
        }
      });

      it('should use correct endpoint', function() {
        return send().then(() => expect(options.hostname).to.equal(client.host));
      });

      it('should use correct port', function() {
        return send().then(() => expect(options.port).to.equal(443));
      });

      it('should use correct method', function() {
        return send().then(() => expect(options.method).to.equal('POST'));
      });

      it('should use correct path', function() {
        return send().then(() => expect(options.path).to.equal(`/3/device/${device}`));
      });

      it('should have authorization header with bearer token', function() {
        return send().then(() => expect(options.headers.authorization).to.equal(`Bearer ${token}`));
      });

      it('should have topic header', function() {
        return send().then(() => expect(options.headers['apns-topic']).to.equal(client.topic));
      });

      it('should have notification in the body', function() {
        return send().then(() => expect(body).to.equal(JSON.stringify(notification)));
      });

    });
  });
});
