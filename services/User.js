'use strict';

module.exports = class User {
  constructor (psid) {
    this.psid = psid;
    this.firstName = ' ';
    this.lastName = ' ';
    this.locale = ' ';
    this.timezone = ' ';
    this.fullName = ' ';
    this.gender = 'neutral';
  }

  setProfile (profile) {
    this.firstName = profile.first_name;
    this.lastName = profile.last_name;
    this.fullName = profile.first_name + ' ' + profile.last_name;
  }
};
