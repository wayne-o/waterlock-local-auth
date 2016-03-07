'use strict';
var bcrypt = require('bcrypt');
var wl = require('../../waterlock-local-auth');

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
    var pass = params.password;

    scope.registerUserAuthObject(params, req, function(err, user) {
      if (err) {
        return res.serverError(err);
      }
      if (user) {

        if (bcrypt.compareSync(pass, user.auth.password)) {
          var authConfig = wl.authConfig;
          if (authConfig.forceEmailVerification && scope.type === 'email') {

            if (user.auth.verified) {
                waterlock.cycle.registerSuccess(req, res, user);
            }
            else {
              waterlock.cycle.loginFailure(req, res, user, {
								error: 'Please verify your email before logging in'
							});
            }
          }

        } else {
          waterlock.cycle.registerFailure(req, res, user, {
            error: 'Invalid ' + scope.type + ' or password'
          });
        }

      } else {
        waterlock.cycle.registerFailure(req, res, null, {
          error: scope.type + ' is already in use'
        });
      }
    });

  }
};
