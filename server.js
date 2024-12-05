const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./config/.env" });
const PORT = process.env.PORT;
const app = express();
const URI = process.env.MongoDB_URI;
const Users = require("./models/Users");

app.use(express.json());

//? Connect to the DB
mongoose.connect(URI);
try {
  console.log("Yeap Connected to MongoDB...");
} catch (error) {
  console.log("Error When Connecting To MongoDB", error);
}

//? Home Page
app.get("/", (req, res) => {
  res.send(`Welcome to our application
            type "http://localhost:${PORT}/all-users" to see all users in the database`);
});

//? Get all users
app.get("/all-users", async (req, res) => {
  try {
    // Fetch all users from the database
    const getAllUsers = await Users.find();

    // Check if users are found
    if (getAllUsers.length === 0) {
      return res.status(404).json({ error: "No users found in the database" });
    }

    // Return the list of users
    res.status(200).json({
      message: "Users retrieved successfully",
      users: getAllUsers,
    });
  } catch (error) {
    console.error("An error occurred while retrieving users:", error);

    // Return a generic error response
    res.status(500).json({
      error:
        "An error occurred while retrieving users. Please try again later.",
    });
  }
});

//? Add user to the database
app.post("/add-user", async (req, res) => {
  try {
    const { name, age, email, gender } = req.body;

    // Validate request body
    if (!name || !age || !email || !gender) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create a new user
    const addNewUser = new Users({
      name,
      age,
      email,
      gender,
    });

    // Save the user to the database
    await addNewUser.save();
    console.log("User added successfully to the database!");
    res
      .status(201)
      .json({ message: "User added successfully!", user: addNewUser });
  } catch (error) {
    console.error("Error adding user:", error);
    if (error.code === 11000) {
      // Handle duplicate email error
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

//? Edit user by ID
app.put("/edit-user/:id", async (req, res) => {
  try {
    const { id } = req.params; // Extract ID from the request parameters
    const { name, age, email, gender } = req.body; // Extract fields to update

    // Validate input
    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    // Update the user in the database
    const updatedUser = await Users.findByIdAndUpdate(
      id,
      { name, age, email, gender },
      { new: true } // Return the updated document
    );

    // Check if the user exists
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("An error occurred while updating the user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//? Delete user by ID
app.delete("/delete-user/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Find and delete the user by ID
    const result = await Users.findOneAndDelete({ _id: id });

    // Handle case when no user is found
    if (!result) {
      return res.status(404).json({ error: `No user found with ID: ${id}` });
    }

    console.log("User deleted successfully");
    res.status(200).json({
      message: "User deleted successfully",
      deletedUser: result,
    });
  } catch (error) {
    console.log("An error occurred while deleting the user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the user" });
  }
});

app.listen(
  PORT,
  console.log(`Server is running on port ${PORT} => http://localhost:${PORT}`)
);
