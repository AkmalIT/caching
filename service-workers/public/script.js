if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      (registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );
      },
      (error) => {
        console.error("Service Worker registration failed:", error);
      }
    );
  });
}

document.getElementById("add-todo").addEventListener("click", addTodo);
document.addEventListener("DOMContentLoaded", loadTodos);

function loadTodos() {
  fetch("/todos")
    .then((response) => response.json())
    .then((data) => {
      const todoList = document.getElementById("todo-list");
      todoList.innerHTML = "";
      data.forEach((todo) => {
        const li = document.createElement("li");
        li.textContent = todo.title;
        todoList.appendChild(li);
      });
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
      const todoList = document.getElementById("todo-list");
      const li = document.createElement("li");
      li.textContent = todo.title;
      todoList.appendChild(li);
      newTodoInput.value = "";
    });
}
