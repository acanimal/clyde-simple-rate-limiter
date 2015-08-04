"use strict";

var path = require("path"),
    request = require("supertest"),
    http = require("http"),
    clyde = require("clydeio");


describe("simple-rate-limiter", function() {

  var server;

  afterEach(function(done) {
    server.close(function(err) {
      if (err) {
        return done(err);
      }
      return done();
    });
  });


  it("should fail due global limit exceed", function(done) {

    var logDirectory = path.join(__dirname, "../tmp");

    var options = {
      logfile: path.join(logDirectory, "clyde.log"),
      loglevel: "info",

      prefilters: [
        {
          id: "simple-rate-limiter",
          path: path.join(__dirname, "../lib/index.js"),
          config: {
            global: {
              tokens: 1,
              interval: "second"
            }
          }
        }
      ],

      providers: [
        {
          id: "id",
          context: "/provider",
          target: "http://server"
        }
      ]
    };

    // Create server with clyde's middleware options
    var middleware = clyde.createMiddleware(options);
    server = http.createServer(middleware);
    server.listen(8881);

    // Make two request expecting the second call to get 421
    var app = request("http://localhost:8881");

    app.get("/foo")
      .expect(404)
      .end(function(err) {
        if (err) {
          return done(err);
        }
        app.get("/foo")
          .expect(421, done);
      });

  });


  it("should fail due global consumer limit exceed", function(done) {

    var logDirectory = path.join(__dirname, "../tmp");

    var options = {
      logfile: path.join(logDirectory, "clyde.log"),
      loglevel: "info",

      prefilters: [
        {
          id: "http-auth",
          path: "clydeio-simple-http-auth",
          config: {
            method: "basic",
            consumers: {
              userA: "passwordA"
            }
          }
        },
        {
          id: "XXX-simple-rate-limiter",
          path: path.join(__dirname, "../lib/index.js"),
          config: {
            consumers: {
              userA: {
                tokens: 1,
                interval: "second"
              }
            }
          }
        }
      ],

      providers: [
        {
          id: "id",
          context: "/provider",
          target: "http://server"
        }
      ]
    };

    // Create server with clyde's middleware options
    var middleware = clyde.createMiddleware(options);
    server = http.createServer(middleware);
    server.listen(8882);

    // Make two request expecting the second call to get 421
    var app = request("http://localhost:8882");

    app.get("/foo")
      .auth("userA", "passwordA")
      .expect(404)
      .end(function(err) {
        if (err) {
          return done(err);
        }
        app.get("/foo")
          .auth("userA", "passwordA")
          .expect(421, done);
      });

  });


  it("should fail due provider global limit exceed", function(done) {

    var logDirectory = path.join(__dirname, "../tmp");

    var options = {
      logfile: path.join(logDirectory, "clyde.log"),
      loglevel: "info",

      providers: [
        {
          id: "providerA",
          context: "/provider",
          target: "http://server",

          prefilters: [
            {
              id: "AAA-simple-rate-limiter",
              path: path.join(__dirname, "../lib/index.js"),
              config: {
                providers: {
                  providerA: {
                    global: {
                      tokens: 1,
                      interval: "second"
                    }
                  }
                }
              }
            }
          ]
        }
      ]

    };

    // Create server with clyde's middleware options
    var middleware = clyde.createMiddleware(options);
    server = http.createServer(middleware);
    server.listen(8883);

    // Make two request expecting the second call to get 421
    var app = request("http://localhost:8883");

    app.get("/provider")
      .expect(500)
      .end(function(err) {
        if (err) {
          return done(err);
        }
        app.get("/provider")
          .expect(421, done);
      });

  });


  it("should fail due provider-consumer limit exceed", function(done) {

    var logDirectory = path.join(__dirname, "../tmp");

    var options = {
      logfile: path.join(logDirectory, "clyde.log"),
      loglevel: "info",

      prefilters: [
        {
          id: "http-auth",
          path: "clydeio-simple-http-auth",
          config: {
            method: "basic",
            consumers: {
              userB: "passwordB"
            }
          }
        }
      ],

      providers: [
        {
          id: "providerB",
          context: "/provider",
          target: "http://server",

          prefilters: [
            {
              id: "simple-rate-limit",
              path: path.join(__dirname, "../lib/index.js"),
              config: {
                providers: {
                  providerB: {
                    consumers: {
                      userB: {
                        tokens: 1,
                        interval: "second"
                      }
                    }
                  }
                }
              }
            }
          ]

        }
      ]

    };

    // Create server with clyde's middleware options
    var middleware = clyde.createMiddleware(options);
    server = http.createServer(middleware);
    server.listen(8884);

    // Make two request expecting the second call to get 421
    var app = request("http://localhost:8884");

    app.get("/provider")
      .auth("userB", "passwordB")
      .expect(500)
      .end(function(err) {
        if (err) {
          return done(err);
        }
        app.get("/provider")
          .auth("userB", "passwordB")
          .expect(421, done);
      });

  });

});
