`use strict`;

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const faker = require('faker');

const Topic = require('../topic');
const APNSError = require('../error');

describe('topic', function() {

  const token = faker.random.uuid();
  const device = faker.random.uuid();
  const notification = {aps:{alert:faker.random.word()}};

  describe('#constructor', function() {

    it('should create with topic for production', function() {
      const topic = new Topic('com.auth0.sample.APNS', 'production');
      expect(topic.name).to.be.equal('com.auth0.sample.APNS');
      expect(topic.host).to.be.equal('api.push.apple.com');
    });

    it('should create with topic for development', function() {
      const topic = new Topic('com.auth0.sample.APNS', 'development');
      expect(topic.name).to.be.equal('com.auth0.sample.APNS');
      expect(topic.host).to.be.equal('api.development.push.apple.com');
    });

    it('should create with topic only', function() {
      const topic = new Topic('com.auth0.sample.APNS');
      expect(topic.name).to.be.equal('com.auth0.sample.APNS');
      expect(topic.host).to.be.equal('api.push.apple.com');
    });

    it('should fail to build with no topic', function() {
      expect(() => new Topic()).to.throw(Error);
    });

  });

  describe('#send', function() {

    const name = 'com.auth0.sample.apns';
    var topic;

    beforeEach(function() {
      topic = new Topic(name);
      topic._request = () => { throw new Error('MOCKED!') };
    });

    describe('validations', function() {
      it('should fail with no parameters', function() {
        return expect(topic.send()).to.be.rejected;
      });

      it('should fail with only notification', function() {
        return expect(topic.send(notification)).to.be.rejected;
      });

      it('should fail without token', function() {
        return expect(topic.send(notification, device)).to.be.rejected;
      });

      it('should fail with null notification', function() {
        return expect(topic.send(null, device, token)).to.be.rejected;
      });

      it('should fail with null device', function() {
        return expect(topic.send(notification, null, token)).to.be.rejected;
      });

      it('should fail with null token', function() {
        return expect(topic.send(notification, device, null)).to.be.rejected;
      });
    });

    describe('request', function() {

      var options, body;
      const send = () => topic.send(notification, device, token);

      beforeEach(function() {
        options = {};
        body = null;
        topic._request = (opts, payload) => {
          options = opts;
          body = payload;
          return Promise.resolve({status: 200, headers: {'apns-id': faker.random.uuid()}});
        };
      });

      it('should use correct endpoint', function() {
        return send().then(() => expect(options.hostname).to.equal(topic.host));
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
        return send().then(() => expect(options.headers['apns-topic']).to.equal(topic.name));
      });

      it('should have notification in the body', function() {
        return send().then(() => expect(body).to.equal(JSON.stringify(notification)));
      });
    });

    describe('response', function() {

      const send = () => topic.send(notification, device, token);

      it('should return apns-id on success', function() {
        const id = faker.random.uuid();
        topic._request = () => Promise.resolve({status: 200, headers: {'apns-id': id}});
        return expect(send()).to.eventually.have.property('id', id);
      });

      it('should return APNS error on failure', function() {
        topic._request = () => Promise.resolve({status: 400, data: JSON.stringify({reason: APNSError.Reasons.DeviceTokenNotForTopic.name})});
        return expect(send()).to.eventually.be.rejectedWith(APNSError, APNSError.Reasons.DeviceTokenNotForTopic.message);
      });

    });
  });
});
