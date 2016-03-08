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

function sendEmail(sails, a, cb) {
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
					cb();
				});
		});
}

function generateScope(scopeKey, engine) {
	return {
		type: scopeKey,
		engine: engine,

		getUserAuthObject: function(attributes, req, cb) {
			var attr = {
				password: attributes.password,
				provider: attributes.type
			};

			attr[scopeKey] = attributes[scopeKey];

			var criteria = {
				provider: attributes.type
			};
			criteria[scopeKey] = attr[scopeKey];

			if (authConfig.createOnNotFound) {
        this.engine.findOrCreateAuth(criteria, attr, function(err, auth) {
          if (err) {
            //log the err
          }
          if (!auth.verificationEmailSent) {
            sendEmail(sails, auth, cb);
          }else {
            cb();
          }
        });
			} else {
				this.engine.findAuth(criteria, function(err, auth) {
          if (err) {
            //log the err
          }
          if (!auth.verificationEmailSent) {
            sendEmail(sails, auth, cb);
          }else {
            cb();
          }
        });
			}
		}
	};
}
