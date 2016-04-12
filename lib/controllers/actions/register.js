'use strict';
var bcrypt = require('bcrypt');

/**
 * Login action
 */
module.exports = function(req, res) {

  var scope = require('../../scope')(waterlock.Auth, waterlock.engine);
  var params = req.params.all();

  if (typeof params[scope.type] === 'undefined' || typeof params.password === 'undefined') {
    waterlock.cycle.registerFailure(req, res, null, {
      error: 'Invalid ' + scope.type + ' or password'
    });
  } else {
    scope.registerUserAuthObject(params, req, function(err, user) {
      if (err) {
        return res.serverError(err);
      }
      if (user) {
        waterlock.cycle.registerSuccess(req, res, user);
      } else {
        waterlock.cycle.registerFailure(req, res, null, {
          error: scope.type + ' is already in use'
        });
      }
    });
  }
};
