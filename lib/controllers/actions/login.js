'use strict';
var bcrypt = require('bcrypt');
var _ = require('lodash');
var wl = require('../../waterlock-local-auth');

/**
 * Login action
 */
module.exports = function(req, res) {

	var scope = require('../../scope')(waterlock.Auth, waterlock.engine);
	var params = req.params.all();

	if (typeof params[scope.type] === 'undefined' || typeof params.password !== 'string') {
		waterlock.cycle.loginFailure(req, res, null, {
			error: 'Invalid ' + scope.type + ' or password'
		});
	} else {
		var pass = params.password;
		scope.getUserAuthObject(params, req, function(err, user) {
			if (err) {
				if (err.code === 'E_VALIDATION') {
					return res.status(400)
						.json(err);
				} else {
					return res.serverError(err);
				}
			}
			if (user) {

				var auth = _.find(user.auths, function(o) {
					return o.provider === 'local';
				});

				if (auth.password && bcrypt.compareSync(pass, auth.password)) {

					var authConfig = wl.authConfig;

					if (auth.verified) {
						if (authConfig.forceEmailVerification && scope.type === 'email') {
							waterlock.cycle.loginSuccess(req, res, user);
						} else {
							return res.ok({
								status: 'registered',
								message: 'Please verify your email address.'
							});
						}
					}else {
						return res.ok({
							status: 'registered',
							message: 'Please verify your email address.'
						});
					}
				}

				//if we got this far they aren't good
				waterlock.cycle.loginFailure(req, res, user, {
					error: 'Invalid ' + scope.type + ' or password'
				});


			} else {
				//TODO redirect to register
				waterlock.cycle.loginFailure(req, res, null, {
					error: 'user not found'
				});
			}
		});
	}
};
