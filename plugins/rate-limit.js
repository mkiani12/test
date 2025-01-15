"use strict";

const fastifyPlugin = require("fastify-plugin");

async function rateLimitConnector(fastify, options) {
  fastify.register(require("@fastify/rate-limit"), {
    max: 100,
    timeWindow: "1 minute",
    skipOnError: true,
  });
}

module.exports = fastifyPlugin(rateLimitConnector);
