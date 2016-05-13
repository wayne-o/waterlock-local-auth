'use strict';
/**
 * EmailVerification
 *
 * @module      :: Model
 * @description :: Describes a users email verification token
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = {

  attributes: require('waterlock').models.emailVerification.attributes({
    /* e.g.
    nickname: 'string'
    */
  }),

  beforeCreate: require('waterlock').models.emailVerification.beforeCreate,
  afterCreate: require('waterlock').models.emailVerification.afterCreate
};
