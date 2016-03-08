'use strict';
exports.login = require('./actions/login');
exports.logout = require('./actions/logout');
exports.verify = require('./actions/verify');

exports.extras = {
  reset: require('./actions/reset')
};
