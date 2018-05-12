const mongoose = require("mongoose");
const util = require("util");
const redis = require("redis");
const keys = require("./../config/keys");

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "");
  return this;
};

mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) return exec.apply(this, arguments);
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  // // do we have any cached data related to this query
  const cachedData = await client.hget(this.hashKey, key);

  // // if yes, then respond and returm
  if (cachedData) {
    const doc = JSON.parse(cachedData);

    return Array.isArray(doc)
      ? doc.map(d => this.model(d))
      : new this.model(doc);
  }

  const result = await exec.apply(this, arguments);
  client.hset(this.hashKey, key, JSON.stringify(result));

  return result;
};

module.exports = {
  clearCache(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};
