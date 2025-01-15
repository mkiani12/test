"use strict";

const { test } = require("tap");
const Fastify = require("fastify");
const mongodbPlugin = require("../../plugins/mongodb");

test("MongoDB plugin should connect to the database", async (t) => {
  const fastify = Fastify();

  await fastify.register(mongodbPlugin, {
    url: "mongodb://localhost:27017/test",
  });

  t.teardown(() => fastify.close());

  await fastify.ready();

  t.ok(fastify.mongo, "MongoDB plugin is registered");
  t.ok(fastify.mongo.client, "MongoDB client is connected");
  t.ok(fastify.mongo.db, "MongoDB database is accessible");

  const collection = fastify.mongo.db.collection("testCollection");
  const result = await collection.insertOne({ name: "test" });
  t.ok(result.insertedId, "Document is inserted successfully");
});
