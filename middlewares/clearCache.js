const clearCache = require("./../services/cache").clearCache;

module.exports = async ({ user: { id } }, res, next) => {
  await next();

  clearCache(id);
};
