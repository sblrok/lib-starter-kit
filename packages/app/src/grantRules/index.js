if (typeof window !== 'undefined') {
  module.exports = require('./grantRules.client').default;
} else {
  module.exports = require('./grantRules.server').default;
}
