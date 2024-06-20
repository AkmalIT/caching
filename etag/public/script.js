document.getElementById("add-todo").addEventListener("click", addTodo);
document.addEventListener("DOMContentLoaded", loadTodos);

function loadTodos() {
  const cachedETag = localStorage.getItem("todosETag");
  fetch("/todos", {
    headers: {
      "If-None-Match": cachedETag || "",
    },
  })
    .then((response) => {
      if (response.status === 304) {
        return loadFromLocalStorage();
      } else {
        return response.json();
      }
    })
    .then((data) => {
      saveToLocalStorage(data);
      renderTodos(data);
    })
    .catch((error) => {
      console.error("Error fetching todos:", error);
      loadFromLocalStorage();
    });
}

function renderTodos(todos) {
  const todoList = document.getElementById("todo-list");
  todoList.innerHTML = "";
  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.textContent = todo.title;
    todoList.appendChild(li);
  });
}

function addTodo() {
  const newTodoInput = document.getElementById("new-todo");
  const newTodoTitle = newTodoInput.value;
  if (!newTodoTitle) {
    return;
  }

  fetch("/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: newTodoTitle }),
  })
    .then((response) => response.json())
    .then((todo) => {
      loadTodos();
      newTodoInput.value = "";
    })
    .catch((error) => {
      console.error("Error adding todo:", error);
    });
}

function saveToLocalStorage(data) {
  localStorage.setItem("todos", JSON.stringify(data));
  localStorage.setItem("todosETag", getETag(data));
}

function loadFromLocalStorage() {
  const cachedTodos = JSON.parse(localStorage.getItem("todos")) || [];
  renderTodos(cachedTodos);
  return cachedTodos;
}

function getETag(data) {
  const hash = require("crypto").createHash("sha1");
  hash.update(JSON.stringify(data));
  return hash.digest("hex");
}
