"use strict";

var util = require("util");

/**
 * RateLimitExceeded error triggered with a rate limit is exceeded.
 *
 * @param {String} description Extended description
 * @returns {void}
 */
function RateLimitExceeded(description) {
  Error.captureStackTrace(this, this.constructor);
  this.statusCode = 421;
  this.name = this.constructor.name;
  this.message = "Too many requests !!!";
  if (description) {
    this.message += " " + description;
  }
}
util.inherits(RateLimitExceeded, Error);

RateLimitExceeded.GLOBAL_LIMIT_EXCEEDED = "Global rate limit exceeded.";
RateLimitExceeded.PROVIDER_LIMIT_EXCEEDED = "Provider rate limit exceeded.";
RateLimitExceeded.CONSUMER_LIMIT_EXCEEDED = "Consumer rate limit exceeded.";
RateLimitExceeded.PROVIDER_CONSUMER_LIMIT_EXCEEDED = "Consumer quota on the provider exceeded.";

module.exports = RateLimitExceeded;
