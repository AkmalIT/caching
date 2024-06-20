const express = require("express");
const redis = require("redis");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const client = redis.createClient();

client.on("error", (err) => console.error("Redis client error", err));

(async () => {
  await client.connect();
})();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/todos", async (req, res) => {
  const key = "todos";
  try {
    const data = await client.get(key);
    if (data) {
      res.send(JSON.parse(data));
    } else {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/todos"
      );
      const result = await response.json();
      await client.setEx(key, 3600, JSON.stringify(result));
      res.send(result);
    }
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/todos", async (req, res) => {
  const key = "todos";
  try {
    const todos = await client.get(key);
    let todosList = todos ? JSON.parse(todos) : [];
    const newTodo = {
      id: todosList.length + 1,
      title: req.body.title,
      completed: false,
    };
    todosList.push(newTodo);
    await client.setEx(key, 3600, JSON.stringify(todosList));
    res.send(newTodo);
  } catch (err) {
    console.error("Error adding todo:", err);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
