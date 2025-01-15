"use strict";

const { test } = require("tap");
const { MongoClient } = require("mongodb");
const UserService = require("../../services/user");

test("UserService CRUD operations", async (t) => {
  // MongoDB Docker container URI
  const uri = "mongodb://localhost:27017/test-db"; // MongoDB URI (make sure Docker container is running)

  // Connect to MongoDB
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("test");
  const userService = new UserService(db);

  t.teardown(async () => {
    await client.close();
    // Docker container will continue running, no need for additional stop operations
  });

  // Test Data
  const userData = { name: "Mohammad Kiani", email: "test@example.com" };

  // Create User
  const newUser = await userService.createUser(userData);
  t.ok(newUser._id, "User is created with an ID");
  t.equal(newUser.name, userData.name, "User name is correct");
  t.equal(newUser.email, userData.email, "User email is correct");

  // Get All Users
  const users = await userService.getAllUsers();
  t.equal(users.length, 1, "One user exists in the database");

  // Get User by ID
  const userById = await userService.getUserById(newUser._id);
  t.ok(userById, "User is fetched by ID");
  t.equal(userById.name, userData.name, "Fetched user name is correct");

  // Update User
  const updated = await userService.updateUser(newUser._id, {
    name: "Mahmood Kiani",
    email: "test2@example.com",
  });
  t.ok(updated, "User is updated successfully");

  // Verify Update
  const updatedUser = await userService.getUserById(newUser._id);
  t.equal(updatedUser.name, "Mahmood Kiani", "Updated user name is correct");

  // Delete User
  const deleted = await userService.deleteUser(newUser._id);
  t.ok(deleted, "User is deleted successfully");

  // Verify Deletion
  const deletedUser = await userService.getUserById(newUser._id);
  t.notOk(deletedUser, "Deleted user no longer exists");
});
