document.getElementById("add-todo").addEventListener("click", addTodo);
document.addEventListener("DOMContentLoaded", loadTodos);

function loadTodos() {
  const cachedTodos = localStorage.getItem("todos");
  if (cachedTodos) {
    renderTodos(JSON.parse(cachedTodos));
  } else {
    fetch("/todos")
      .then((response) => response.json())
      .then((data) => {
        localStorage.setItem("todos", JSON.stringify(data));
        renderTodos(data);
      });
  }
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
      const cachedTodos = JSON.parse(localStorage.getItem("todos")) || [];
      cachedTodos.push(todo);
      localStorage.setItem("todos", JSON.stringify(cachedTodos));
      renderTodos(cachedTodos);
      newTodoInput.value = "";
    });
}
