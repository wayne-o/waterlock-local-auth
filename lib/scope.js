'use strict';
var _ = require('lodash');
var authConfig = require('./waterlock-local-auth')
	.authConfig;

/**
 * TODO these can be refactored later
 * @type {Object}
 */

module.exports = function(Auth, engine) {
	var def = Auth.definition;

	if (!_.isUndefined(def.email)) {
		return generateScope('email', engine);
	} else if (typeof def.username !== 'undefined') {
		return generateScope('username', engine);
	} else {
		var error = new Error('Auth model must have either an email or username attribute');
		throw error;
	}
};

function sendEmail(sails, a, user, cb) {
	sails.models.emailverification.create({
			owner: a.id
		})
		.exec(function(err, t) {
			if (err) {
				cb(err);
			}
			sails.models.auth.update({
					id: a.id
				}, {
					emailVerification: t.id
				})
				.exec(function(err) {
					if (err) {
						cb(err);
					}
					cb(null, user);
				});
		});
}

function generateScope(scopeKey, engine) {
	return {
		type: scopeKey,
		engine: engine,

		registerUserAuthObject: function(attributes, req, cb) {
			var attr = {
				password: attributes.password
			};
			attr[scopeKey] = attributes[scopeKey];

			var criteria = {};
			criteria[scopeKey] = attr[scopeKey];

			this.engine.findOrCreateAuth(criteria, attr, function(err, user) {
				if (err) {
					cb(err);
				}
				var auth = _.find(user.auths, function(o) {
						return o.provider === 'local';
					});

					if (!auth.verificationEmailSent) {
						sendEmail(sails, auth, user, cb);
					} else {
						cb(user);
					}
			});
		},

		getUserAuthObject: function(attributes, req, cb) {
			var attr = {
				password: attributes.password,
				provider: attributes.type
			};

			attr[scopeKey] = attributes[scopeKey];

			if (attributes.username) {
				attr.username = attributes.username;
			}

			var criteria = {
				provider: attributes.type
			};
			criteria[scopeKey] = attr[scopeKey];

			if (authConfig.createOnNotFound) {
				this.engine.findOrCreateAuth(criteria, attr, function(err, user) {
					if (err) {
						//log the err
					}

					var auth = _.find(user.auths, function(o) {
						return o.provider === 'local';
					});

					if (!auth.verificationEmailSent) {
						sendEmail(sails, auth, user, cb);
					} else {
						cb(user);
					}
				});
			} else {
				this.engine.findAuth(criteria, function(err, auth) {
					if (err) {
						//log the err
					}
					if (auth && !auth.verificationEmailSent) {
						sendEmail(sails, auth, auth.user, cb);
					} else {
						if (auth) {
							cb(auth.user);
						} else {
							cb(null);
						}
					}
				});
			}
		}
	};
}
