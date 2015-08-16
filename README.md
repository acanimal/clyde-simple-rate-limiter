# Simple Rate Limiter Filter

A basic rate limiter implementation filter for [Clyde](https://github.com/acanimal/clyde) API gateway, which allows to limit the rate consume.

> Implementation is based on [limiter](https://github.com/jhurliman/node-rate-limiter) module.

<!-- TOC depth:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Simple Rate Limiter Filter](#simple-rate-limiter-filter)
	- [Installation](#installation)
	- [Configuration](#configuration)
	- [Examples](#examples)
		- [Limit global access to 100 req/sec](#limit-global-access-to-100-reqsec)
		- [Limit access to a provider to 100 req/sec](#limit-access-to-a-provider-to-100-reqsec)
		- [Limit access to a provider to 100 req/sec and to the `userA` consumer rate limited to 20 req/sec](#limit-access-to-a-provider-to-100-reqsec-and-to-the-usera-consumer-rate-limited-to-20-reqsec)
	- [Notes](#notes)
- [License](#license)

<!-- /TOC -->

## Installation

`npm install clydeio-simple-rate-limiter --save`

## Configuration

Rate limiter filter is extremely flexible and allows limit access globally or per consumer. The filter accepts the configuration properties:

* `global`: Specifies the limits to be applied globally. It must be an object with the properties:
  - `tokens`: Number of allowed access
  - `interval`: Interval within the previous accesses are allowed. Allowed values are: `sec/second`, `min/minute`, `hr/hour` and `day`.

* `consumers`: Specifies the global limits per consumers. For each consumer and object with `tokens` and `interval` properties must be specified.

At least one property must be specified, that is, at least `global` or `consumers` must be set.

## Examples

### Limit global access to 100 req/sec

```javascript
{
  "prefilters" : [
    {
      "id" : "rate-limiter",
      "path" : "clydeio-simple-rate-limiter",
      "config" : {
        "global" : {
          "tokens" : 100,
          "interval" : "second"
        },
        ...
      }
    }
  ],
  "provider": [
    ...
  ]
}
```

### Limit access to a provider to 100 req/sec

```javascript
{
  providers: [
    {
      "id": "idProvider",
      "context": "/provider",
      "target": "http://provider_server",
      "prefilters" : [
        {
          "id" : "rate-limiter",
          "path" : "clydeio-simple-rate-limiter",
          "config" : {
            "global" : {
              "tokens" : 100,
              "interval" : "second"
            }
          }
        }
      ]
    }
  ]
}
```

### Limit access to a provider to 100 req/sec and to the `userA` consumer rate limited to 20 req/sec

```javascript
{
  providers: [
    {
      "id": "idProvider",
      "context": "/provider",
      "target": "http://provider_server",
      "prefilters" : [
        {
          "id" : "rate-limiter",
          "path" : "clydeio-simple-rate-limiter",
          "config" : {
            "global" : {
              "tokens" : 100,
              "interval" : "second"
            },
            "consumers" : {
              "userA" : {
                "tokens" : 20,
                "interval" : "second"
              }
            }
          }
        }
      ]
    }
  ]
}
```

## Notes

* It has no sense configure the rate limiter filter as a global or provider's postfilter.
* Limits are applied in the order: global and consumers. Be aware when chaining limits.


# License

The MIT License (MIT)

Copyright (c) 2015 Antonio Santiago (@acanimal)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
