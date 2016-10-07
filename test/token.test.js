`use strict`;

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const jwt = require('jsonwebtoken');
const fs = require('fs');

const Store = require('../token');

const path = `${__dirname}/key.p8`
console.log(`Loading key from path ${path}`);
const key = fs.readFileSync(path);
console.log(`Loaded key:\n ${key}`);

describe('token', function() {

  describe('#constructor', function() {

    it('should fail with no arguments', function() {
      expect(() => new Store()).to.throw(Error);
    });

    it('should fail with no key', function() {
      expect(() => new Store('TEAM_ID')).to.throw(Error);
    });

    it('should fail with no key id', function() {
      expect(() => new Store('TEAM_ID', { pem: key})).to.throw(Error);
    });

    it('should fail with no key path', function() {
      expect(() => new Store('TEAM_ID', { id: 'IOU a key id'})).to.throw(Error);
    });

    it('should fail with no team identifier', function() {
      expect(() => new Store(null, { pem: key})).to.throw(Error);
    });

    it('should create a new store', function() {
      expect(new Store('TEAM_ID', { id: 'AN_ID', pem: key})).to.not.be.null;
    });
  });

  describe('#get', function() {

    var store;

    beforeEach(function() {
      store = new Store('TEAM_ID', { id: 'AN_ID', pem: key});
    });

    it('should return a token', function() {
      return expect(store.get()).to.eventually.be.fulfilled;
    });

    it('should return a token with iat', function() {
      return expect(store.get().then(claims)).to.eventually.have.property('iat');
    });

    it('should return a token with issuer', function() {
      return expect(store.get().then(claims)).to.eventually.have.property('iss', 'TEAM_ID');
    });

    it('should return a token expiring in 50 minutes by default', function() {
      return expect(store.get().then(claims).then(claims => claims.exp - claims.iat)).to.eventually.eq(3000); // 50 * 60
    });

    it('should return a token with key id in header', function() {
      return expect(store.get().then(header)).to.eventually.have.property('kid', 'AN_ID');
    });

    it('should return the same token', function() {
      return store.get().then(token => expect(store.get()).to.eventually.equal(token));
    });

    it('should return the different token when cached is expired', function() {
      return store.get(1).then(token => new Promise(resolve => setTimeout(() => resolve(expect(store.get()).to.eventually.not.equal(token)), 1100)));
    });

    it('should fail when key is invalid', function() {
      const store = new Store('TEAM_ID', { id: 'AN_ID', pem: 'not-a-valid-pem'});
      return expect(store.get()).to.be.rejected;
    });
  });
});

const claims = (token) => {
  return jwt.decode(token);
};

const header = (token) => {
  return jwt.decode(token, {complete: true}).header;
};
