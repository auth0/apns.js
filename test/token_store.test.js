`use strict`;

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const jwt = require('jsonwebtoken');

const TokenStore = require('../token_store');

describe('TokenStore', function() {

  describe('#constructor', function() {

    it('should fail with no arguments', function() {
      expect(() => new TokenStore()).to.throw(Error);
    });

    it('should fail with no key', function() {
      expect(() => new TokenStore('TEAM_ID')).to.throw(Error);
    });

    it('should fail with no key id', function() {
      expect(() => new TokenStore('TEAM_ID', { path: '/tmp/key.p8'})).to.throw(Error);
    });

    it('should fail with no key path', function() {
      expect(() => new TokenStore('TEAM_ID', { id: 'IOU a key id'})).to.throw(Error);
    });

    it('should fail with no team identifier', function() {
      expect(() => new TokenStore(null, { path: '/tmp/key.p8'})).to.throw(Error);
    });

    it('should create a new store', function() {
      expect(new TokenStore('TEAM_ID', { id: 'AN_ID', path: '/tmp/key.p8'})).to.not.be.null;
    });
  });

  describe('#get', function() {

    var store;

    beforeEach(function() {
      store = new TokenStore('TEAM_ID', { id: 'AN_ID', path: `${__dirname}/key.p8`});
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

    it('should return a token expiring in 50 minutes', function() {
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

    it('should fail when key cannot be loaded', function() {
      const store = new TokenStore('TEAM_ID', { id: 'AN_ID', path: `${__dirname}/should-not-found-key.p8`});
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
