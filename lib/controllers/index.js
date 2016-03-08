'use strict';
exports.login = require('./actions/login');
exports.logout = require('./actions/logout');

exports.extras = {
  reset: require('./actions/reset'),
  verify: require('./actions/verify')
};
