'use strict';

var jade = require('jade');
var path = require('path');

exports.getHtmlEmailForEmailVerification = function(token){
  var config = require('./waterlock-local-auth').config;
  var authConfig = require('./waterlock-local-auth').authConfig;
  if(typeof config === 'undefined'){
    throw new Error('No config file defined, try running [waterlock install config]');
  }

  var verifyUrl;
    if (authConfig.emailVerification.mail.forwardUrl) {
      if (authConfig.emailVerification.mail.forwardUrl.indexOf('?') > -1) {
        verifyUrl = authConfig.emailVerification.mail.forwardUrl + '&token=' + token.token;
      }else {
        verifyUrl = authConfig.emailVerification.mail.forwardUrl + '?token=' + token.token;
      }

    }
    else {
      if (config.pluralizeEndpoints) {
        verifyUrl = config.baseUrl + '/auths/reset?token=' + token.token;
      }else {
        verifyUrl = config.baseUrl + '/auth/reset?token=' + token.token;
      }
    }

  var viewVars = authConfig.emailVerification.template.vars;
  viewVars.url = verifyUrl;

  var templatePath = path.normalize(__dirname+'../../../'+authConfig.emailVerification.template.file);
  var html = jade.renderFile(templatePath, viewVars);

  return html;
};

/**
 * Returns the email jade template as html
 * @param  {Token} token
 * @return {String} html
 */
exports.getHtmlEmailForPasswordReset = function(token){
  var config = require('./waterlock-local-auth').config;
  var authConfig = require('./waterlock-local-auth').authConfig;
  if(typeof config === 'undefined'){
    throw new Error('No config file defined, try running [waterlock install config]');
  }

  var resetUrl;
  if (config.pluralizeEndpoints) {
    resetUrl = config.baseUrl + '/auths/reset?token='+token.token;
  }else {
    resetUrl = config.baseUrl + '/auth/reset?token='+token.token;
  }


  var viewVars = authConfig.passwordReset.template.vars;
  viewVars.url = resetUrl;

  var templatePath = path.normalize(__dirname+'../../../'+authConfig.passwordReset.template.file);
  var html = jade.renderFile(templatePath, viewVars);

  return html;
};

/**
 * Callback for mailing operation
 * @param  {Object} error
 * @param  {Object} response
 */
exports.mailCallback = function(error, info){
   if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
};
