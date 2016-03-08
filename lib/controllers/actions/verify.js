'use strict';
var jwt = require('jwt-simple');
var _ = require('lodash');
var wl = require('../../waterlock-local-auth');

module.exports = function(req, res){
  var params = allParams(req);
  validateToken(req, res, sails, params);
};

/**
 * gathers all params for this request
 * @param  object req the express request object
 * @return object     all params
 */
function allParams(req){
  var params = req.params.all();
  return _.merge(req.query, params);
}

function validateToken(req, res, sails, params){
  var config = wl.config;
  //var authConfig = wl.authConfig;
  if(params.token){
    try{
      // decode the token
      var _token = jwt.decode(params.token, config.jsonWebTokens.secret);

      // set the time of the request
      var _reqTime = Date.now();

      // If token is expired
      if(_token.exp <= _reqTime){
        return res.forbidden('Your token is expired.');
      }

      // If token is early
      if(_reqTime <= _token.nbf){
        return res.forbidden('This token is early.');
      }

      // If audience doesn't match
      if(config.jsonWebTokens.audience !== _token.aud){
        return res.forbidden('This token cannot be accepted for this domain.');
      }

      // If the subject doesn't match
      if('password reset' !== _token.sub){
        return res.forbidden('This token cannot be used for this request.');
      }

      sails.models.auth.findOne(_token.iss).populate('emailVerification').exec(function(err, auth){
        if(typeof auth.emailVerification === 'undefined' || params.token !== auth.emailVerification.token){
          return res.forbidden('This token cannot be used.');
        }

        req.session.emailVerification = auth.emailVerification;

        // if(authConfig.passwordReset.mail.forwardUrl){
        //   res.redirect(authConfig.passwordReset.mail.forwardUrl + '?token=' + auth.resetToken.token);
        // }else{
          res.json(200);
        // }

      });

    } catch(err){
      return res.serverError(err);
    }
  }else{
    //TODO limit attempts?
    req.session.resetToken = false;
    res.forbidden();
  }
}
