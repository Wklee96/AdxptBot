'use strict';

module.exports = class User {
  constructor (psid) {
    this.psid = psid;
    this.firstName = '';
    this.lastName = '';
    this.locale = '';
    this.timezone = '';
    this.fullName = '';
    this.gender = 'neutral';
  }

  setProfile (profile) {
    this.firstName = profile.first_name;
    this.lastName = profile.last_name;
    this.locale = profile.locale;
    this.timezone = profile.timezone;
    if (profile.gender) {
      this.gender = profile.gender;
    }
    this.fullName = profile.first_name + ' ' + profile.last_name;
  }
};
