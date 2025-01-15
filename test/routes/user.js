"use strict";

module.exports = async function (fastify, opts) {
  const collection = fastify.mongo.db.collection("users");

  // Create User
  fastify.post("/users", async (request, reply) => {
    const { name, email } = request.body;
    const result = await collection.insertOne({ name, email });
    reply.code(201).send(result.ops[0]);
  });

  // Read All Users
  fastify.get("/users", async (request, reply) => {
    const users = await collection.find().toArray();
    reply.send(users);
  });

  // Read User by ID
  fastify.get("/users/:id", async (request, reply) => {
    const { id } = request.params;
    const user = await collection.findOne({
      _id: new fastify.mongo.ObjectId(id),
    });
    if (!user) return reply.code(404).send({ message: "User not found" });
    reply.send(user);
  });

  // Update User
  fastify.put("/users/:id", async (request, reply) => {
    const { id } = request.params;
    const { name, email } = request.body;
    const result = await collection.updateOne(
      { _id: new fastify.mongo.ObjectId(id) },
      { $set: { name, email } }
    );
    if (result.matchedCount === 0)
      return reply.code(404).send({ message: "User not found" });
    reply.send({ message: "User updated" });
  });

  // Delete User
  fastify.delete("/users/:id", async (request, reply) => {
    const { id } = request.params;
    const result = await collection.deleteOne({
      _id: new fastify.mongo.ObjectId(id),
    });
    if (result.deletedCount === 0)
      return reply.code(404).send({ message: "User not found" });
    reply.send({ message: "User deleted" });
  });
};
