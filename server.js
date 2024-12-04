const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./config/.env" });
const PORT = process.env.PORT;
const app = express();
const URI = process.env.MongoDB_URI;
const Users = require("./models/Users");

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
    const getAllUsers = await Users.find();
    if (getAllUsers.length === 0) {
      console.log("No users found in the database");
      res.send("No users found in the database");
    } else {
      res.send(getAllUsers);
      console.log(getAllUsers);
    }
  } catch (error) {
    console.log("An error has occured when getting users", error);
  }
});

//? Add user to the database
app.post("/add-user", async (req, res) => {
  try {
    const addNewUser = new Users({
      name: "Zarrad Iheb",
      age: 22,
      email: "zarradiheb007@gmail.com",
      gender: "Male",
    });
    await addNewUser.save();
    console.log("User added successfully to the database!");
    res.send("User added successfully to the database!");
  } catch (error) {
    console.log("Faled to add a new user please try again");
    res.send("Faled to add a new user please try again");
  }
});
app.listen(
  PORT,
  console.log(`Server is running on port ${PORT} => http://localhost:${PORT}`)
);
