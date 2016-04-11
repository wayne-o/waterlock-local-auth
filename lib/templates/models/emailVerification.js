'use strict';
/**
 * ResetToken
 *
 * @module      :: Model
 * @description :: Describes a users email verification token
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = {

  attributes: require('waterlock').models.emailverification.attributes({

    /* e.g.
    nickname: 'string'
    */

  }),

  beforeCreate: require('waterlock').models.emailverification.beforeCreate,
  afterCreate: require('waterlock').models.emailverification.afterCreate
};
