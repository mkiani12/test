"use strict";

const UserService = require("../services/user");
const { ObjectId } = require("mongodb");

module.exports = async function (fastify, opts) {
  const userService = new UserService(fastify.mongo.db);

  // Create User
  fastify.post("/users", {
    schema: {
      description: "Create a new user",
      tags: ["users"],
      body: {
        type: "object",
        required: ["name", "email", "age"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          age: { type: "integer", minimum: 0 },
        },
      },
      response: {
        201: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            age: { type: "integer" },
          },
        },
        400: {
          type: "object",
          properties: {
            message: { type: "string" },
            error: { type: "string" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const user = await userService.createUser(request.body);
        reply.code(201).send(user);
      } catch (err) {
        console.error("Error creating user:", err);
        reply.code(400).send({ message: "Server error", error: err.message });
      }
    },
  });

  // Get All Users with Filters
  fastify.get("/users", {
    schema: {
      description: "Get all users with optional filters",
      tags: ["users"],
      querystring: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          age: { type: "integer" },
        },
      },
      response: {
        200: {
          type: "array",
          items: {
            type: "object",
            properties: {
              _id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              age: { type: "integer" },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { name, email, age } = request.query;

      const filter = {};
      if (name) filter.name = { $regex: name, $options: "i" };
      if (email) filter.email = { $regex: email, $options: "i" };
      if (age) filter.age = parseInt(age);

      const users = await userService.getAllUsers(filter);
      reply.send(users);
    },
  });

  // Get User by ID
  fastify.get("/users/:id", {
    schema: {
      description: "Get a user by their ID",
      tags: ["users"],
      params: {
        type: "object",
        properties: {
          id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            age: { type: "integer" },
          },
        },
        400: { type: "object", properties: { message: { type: "string" } } },
        404: { type: "object", properties: { message: { type: "string" } } },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      if (!ObjectId.isValid(id)) {
        return reply.code(400).send({ message: "Invalid user ID" });
      }
      const user = await userService.getUserById(id);
      if (!user) {
        return reply.code(404).send({ message: "User not found" });
      }
      reply.send(user);
    },
  });

  // Update User
  fastify.put("/users/:id", {
    schema: {
      description: "Update user details by ID",
      tags: ["users"],
      params: {
        type: "object",
        properties: {
          id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
        },
      },
      body: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
        },
      },
      response: {
        200: { type: "object", properties: { message: { type: "string" } } },
        400: { type: "object", properties: { message: { type: "string" } } },
        404: { type: "object", properties: { message: { type: "string" } } },
      },
    },
    handler: async (request, reply) => {
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
    },
  });

  // Delete User
  fastify.delete("/users/:id", {
    schema: {
      description: "Delete user by ID",
      tags: ["users"],
      params: {
        type: "object",
        properties: {
          id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
        },
      },
      response: {
        200: { type: "object", properties: { message: { type: "string" } } },
        400: { type: "object", properties: { message: { type: "string" } } },
        404: { type: "object", properties: { message: { type: "string" } } },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      if (!ObjectId.isValid(id)) {
        return reply.code(400).send({ message: "Invalid user ID" });
      }
      const deleted = await userService.deleteUser(id);
      if (!deleted) {
        return reply.code(404).send({ message: "User not found" });
      }
      reply.send({ message: "User deleted" });
    },
  });
};
