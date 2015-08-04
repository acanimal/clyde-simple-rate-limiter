"use strict";

var util = require("util");

/**
 * InvalidRateLimitConfiguration error triggered when passed invalid configurations.
 *
 * @param {String} description Extended description
 * @returns {void}
 */
function InvalidRateLimiterConfiguration(description) {
  Error.captureStackTrace(this, this.constructor);
  this.statusCode = 421;
  this.name = this.constructor.name;
  this.message = "Invalid rate limit configuration !!!";
  if (description) {
    this.message += " " + description;
  }
}
util.inherits(InvalidRateLimiterConfiguration, Error);

module.exports = InvalidRateLimiterConfiguration;
