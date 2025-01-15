"use strict";

const fastifyPlugin = require("fastify-plugin");

async function swaggerConnector(fastify, options) {
  fastify.register(require("@fastify/swagger"), {
    swagger: {
      info: {
        title: "API Documentation",
        description: "A test of API",
        version: "1.0.0",
      },
      tags: [{ name: "users", description: "User crud" }],
      schemes: ["http", "https"],
      consumes: ["application/json"],
      produces: ["application/json"],
    },
  });

  fastify.register(require("@fastify/swagger-ui"), {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "none",
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });
}

module.exports = fastifyPlugin(swaggerConnector);
