const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const TodoModel = require("./models/todoList");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URL || "mongodb://localhost:27017", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

const PORT = process.env.PORT || 3001;

mongoose.connection.once("open", () => {
  console.log("MongoDB connected successfully");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Get server time in 12-hour format
app.get("/getServerTime", (req, res) => {
  const serverTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    hour12: true,
  });
  res.json(serverTime);
});

// Get saved tasks from the database
app.get("/getTodoList", (req, res) => {
  TodoModel.find({})
    .then((todoList) => res.json(todoList))
    .catch((err) => res.json(err));
});

// Add new task to the database
app.post("/addTodoList", (req, res) => {
  TodoModel.create({
    task: req.body.task,
    status: req.body.status,
    deadline: req.body.deadline,
  })
    .then((todo) => res.json(todo))
    .catch((err) => res.json(err));
});

// Update task fields (including deadline)
app.post("/updateTodoList/:id", (req, res) => {
  const id = req.params.id;
  const updateData = {
    task: req.body.task,
    status: req.body.status,
    deadline: req.body.deadline,
  };
  TodoModel.findByIdAndUpdate(id, updateData)
    .then((todo) => res.json(todo))
    .catch((err) => res.json(err));
});

// Delete task from the database
app.delete("/deleteTodoList/:id", (req, res) => {
  const id = req.params.id;
  TodoModel.findByIdAndDelete({
    _id: id,
  })
    .then((todo) => res.json(todo))
    .catch((err) => res.json(err));
});

app.get("/", (req, res) => {
  res.send("Hello, this is your Express.js server!");
});

