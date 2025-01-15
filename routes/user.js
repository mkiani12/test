"use strict";

const UserService = require("../services/user");
const { ObjectId } = require("mongodb");

module.exports = async function (fastify, opts) {
  const userService = new UserService(fastify.mongo.db);

  // Create User
  fastify.post("/users", async (request, reply) => {
    try {
      const user = await userService.createUser(request.body);
      reply.code(201).send(user);
    } catch (err) {
      console.error("Error creating user:", err); // Log the error
      reply.code(400).send({ message: "Server error", error: err.message });
    }
  });

  // Get All Users
  fastify.get("/users", async (request, reply) => {
    const users = await userService.getAllUsers();
    reply.send(users);
  });

  // Get User by ID
  fastify.get("/users/:id", async (request, reply) => {
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
      return reply.code(400).send({ message: "Invalid user ID" });
    }
    const user = await userService.getUserById(id);
    if (!user) {
      return reply.code(404).send({ message: "User not found" });
    }
    reply.send(user);
  });

  // Update User
  fastify.put("/users/:id", async (request, reply) => {
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
      return reply.code(400).send({ message: "Invalid user ID" });
    }
    const { name, email } = request.body;
    const updated = await userService.updateUser(id, { name, email });
    if (!updated) {
      return reply.code(404).send({ message: "User not found" });
    }
    reply.send({ message: "User updated" });
  });

  // Delete User
  fastify.delete("/users/:id", async (request, reply) => {
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
      return reply.code(400).send({ message: "Invalid user ID" });
    }
    const deleted = await userService.deleteUser(id);
    if (!deleted) {
      return reply.code(404).send({ message: "User not found" });
    }
    reply.send({ message: "User deleted" });
  });
};
