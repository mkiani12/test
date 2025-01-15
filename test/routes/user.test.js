"use strict";

const { test } = require("tap");
const Fastify = require("fastify");
const UserService = require("../../services/user");
const userRoutes = require("../../routes/user");
const mongodbPlugin = require("../../plugins/mongodb");

test("User routes CRUD operations", async (t) => {
  const fastify = Fastify();

  // Connect to MongoDB running in Docker container
  const uri = "mongodb://localhost:27017/test-db"; // MongoDB URI (make sure to start MongoDB in Docker first)

  // Register MongoDB plugin with the URI
  await fastify.register(mongodbPlugin, { url: uri });
  const userService = new UserService(fastify.mongo.db);

  // Register user routes with dependency injection for the UserService
  fastify.decorate("userService", userService);
  await fastify.register(userRoutes);

  t.teardown(async () => {
    await fastify.close();
    // You don't need to stop MongoDB container manually, Docker will handle it.
  });

  // Test Data
  let userId;

  // Create User
  const createResponse = await fastify.inject({
    method: "POST",
    url: "/users",
    payload: {
      name: "Mohammad Kiani",
      email: "test@example.com",
      age: 22,
    },
  });

  t.equal(createResponse.statusCode, 201, "Create user status code is 201");
  const createdUser = JSON.parse(createResponse.body);
  t.ok(createdUser._id, "User is created with an ID");
  userId = createdUser._id;

  // Get All Users
  const getAllResponse = await fastify.inject({
    method: "GET",
    url: "/users",
  });

  t.equal(getAllResponse.statusCode, 200, "Get all users status code is 200");
  const users = JSON.parse(getAllResponse.body);
  t.ok(users.length > 0, "Users are fetched successfully");

  // Get User by ID
  const getByIdResponse = await fastify.inject({
    method: "GET",
    url: `/users/${userId}`,
  });

  t.equal(getByIdResponse.statusCode, 200, "Get user by ID status code is 200");
  const userById = JSON.parse(getByIdResponse.body);
  t.equal(userById.name, "Mohammad Kiani", "Fetched user has correct name");
  t.equal(userById.email, "test@example.com", "Fetched user has correct email");
  t.equal(userById.age, 22, "Fetched user has correct age");

  // Update User
  const updateResponse = await fastify.inject({
    method: "PUT",
    url: `/users/${userId}`,
    payload: {
      name: "Mahmood Kiani",
      email: "test2@example.com",
      age: 23,
    },
  });

  t.equal(updateResponse.statusCode, 200, "Update user status code is 200");
  const updateMessage = JSON.parse(updateResponse.body);
  t.equal(
    updateMessage.message,
    "User updated",
    "User is updated successfully"
  );

  // Delete User
  const deleteResponse = await fastify.inject({
    method: "DELETE",
    url: `/users/${userId}`,
  });

  t.equal(deleteResponse.statusCode, 200, "Delete user status code is 200");
  const deleteMessage = JSON.parse(deleteResponse.body);
  t.equal(
    deleteMessage.message,
    "User deleted",
    "User is deleted successfully"
  );

  // Verify Deletion
  const verifyDeleteResponse = await fastify.inject({
    method: "GET",
    url: `/users/${userId}`,
  });

  t.equal(verifyDeleteResponse.statusCode, 404, "Deleted user is not found");
});
