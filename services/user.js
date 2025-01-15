"use strict";

const { ObjectId } = require("mongodb");

class UserService {
  constructor(db) {
    this.collection = db.collection("users");
  }

  async createUser(data) {
    if (!data || !data.name || !data.email || !data.age) {
      throw new Error("Invalid user data");
    }
    try {
      const result = await this.collection.insertOne(data);
      const createdUser = this.getUserById(result.insertedId);
      return createdUser;
    } catch (err) {
      console.error("Error inserting user:", err); // Log the detailed error
      throw new Error(`Error inserting user into the database`);
    }
  }

  async getAllUsers() {
    return this.collection.find().toArray();
  }

  async getUserById(id) {
    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  async updateUser(id, data) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
    return result.matchedCount > 0;
  }

  async deleteUser(id) {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}

module.exports = UserService;
