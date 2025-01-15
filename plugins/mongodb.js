"use strict";

const fastifyPlugin = require("fastify-plugin");

async function mongodbConnector(fastify, options) {
  fastify.register(require("@fastify/mongodb"), {
    forceClose: true,
    url: process.env.MONGO_URI || "mongodb://localhost:27017/test",
  });
}

module.exports = fastifyPlugin(mongodbConnector);
