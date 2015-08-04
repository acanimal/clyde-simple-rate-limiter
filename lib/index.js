"use strict";

var InvalidRateLimiterConfiguration = require("./invalid-rate-limiter-configuration-error");
var RateLimitExceeded = require("./rate-limit-exceeded-error");
var RateLimiter = require("limiter").RateLimiter;


/**
 * Validate the configuration parameters.
 *
 * @private
 * @param  {Object} config Configuration
 * @returns {void}
 */
function validateConfig(config) {

  function isValidGlobal(globalCfg) {
    if (globalCfg && (!globalCfg.tokens || !globalCfg.interval)) {
      return false;
    }
    return true;
  }

  function isValidConsumers(consumersCfg) {
    var prop, limitConfig;
    if (consumersCfg) {
      for (prop in consumersCfg) {
        if ({}.hasOwnProperty.call(consumersCfg, prop)) {
          limitConfig = consumersCfg[prop];
          if (limitConfig && (!limitConfig.tokens || !limitConfig.interval)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  if (!config.global && !config.consumers && !config.providers) {
    throw new InvalidRateLimiterConfiguration("At least one global, consumers or providers entry is required.");
  }

  if (!isValidGlobal(config.global)) {
    throw new InvalidRateLimiterConfiguration("Invalid global section.");
  }

  if (!isValidConsumers(config.consumers)) {
    throw new InvalidRateLimiterConfiguration("Invalid consumers section.");
  }

}

/**
 * Creates the limiters corresponding to the specified configuration. The new
 * object has the same properties with limiters as values.
 *
 * @private
 * @param  {Object} config Configuration
 * @returns {Object} Limiters parsed from configuration.
 */
function parseLimiters(config) {

  function parseGlobal(globalCfg) {
    var limiter;
    if (globalCfg.global) {
      limiter = new RateLimiter(globalCfg.global.tokens, globalCfg.global.interval);
    }
    return limiter;
  }

  function parseConsumers(consumersCfg) {
    var prop, limitConfig, limiters = {};
    if (consumersCfg) {
      for (prop in consumersCfg) {
        if ({}.hasOwnProperty.call(consumersCfg, prop)) {
          limitConfig = consumersCfg[prop];
          limiters[prop] = new RateLimiter(limitConfig.tokens, limitConfig.interval);
        }
      }
    }
    return limiters;
  }

  // Parse configuration
  return {
    global: parseGlobal(config),
    consumers: parseConsumers(config.consumers)
  };
}


/**
 * Apply global rate limits.
 *
 * @private
 * @param {Object} globalLimiter Limiter
 * @param  {Function} cb Callback.
 * @returns {void}
 */
function applyGlobalLimit(globalLimiter, cb) {
  if (!globalLimiter) {
    return cb();
  }

  if (!globalLimiter.tryRemoveTokens(1)) {
    return cb(new RateLimitExceeded(RateLimitExceeded.GLOBAL_LIMIT_EXCEEDED));
  }

  return cb();
}


/**
 * Apply limits on consumers.
 *
 * @param {Object} consumersLimiters Consumers configuration
 * @param  {String}   consumerId Consumer ID
 * @param  {Function} cb       Callback
 * @returns {void}
 */
function applyConsumerLimit(consumersLimiters, consumerId, cb) {
  if (!Object.keys(consumersLimiters).length || !consumerId) {
    return cb();
  }

  var limiter = consumersLimiters[consumerId];
  if (!limiter) {
    return cb();
  }

  if (!limiter.tryRemoveTokens(1)) {
    return cb(new RateLimitExceeded(RateLimitExceeded.CONSUMER_LIMIT_EXCEEDED));
  }

  return cb();
}


/**
 * Simple rate limit implementation.
 * Limits can be applied globally or per consumer.
 *
 * @public
 * @param  {String} name Name of the filter
 * @param  {object} config JavaScript object with filter configuration
 * @returns {middleware} Middleware function implementing the filter.
 */
module.exports.init = function(name, config) {

  // Validate configuration
  validateConfig(config);

  // Initialize limiters
  var limiters = parseLimiters(config);

  // Return middleware function that applies rates limits
  return function(req, res, next) {

    var consumerId;
    if (req.user && req.user.userId) {
      consumerId = req.user.userId;
    }

    //
    // Apply rate limits.
    // The chain of limitations follow the order: global, consumer, provider
    // and provider-consumer.
    //
    // TODO - Improve using promises
    //
    applyGlobalLimit(limiters.global, function(errGlobal) {
      if (errGlobal) {
        return next(errGlobal);
      }

      applyConsumerLimit(limiters.consumers, consumerId, function(errConsumer) {
        if (errConsumer) {
          return next(errConsumer);
        }

        return next();
      });

    });

  };

};
