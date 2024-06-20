document.getElementById("add-todo").addEventListener("click", addTodo);
document.addEventListener("DOMContentLoaded", loadTodos);

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("todoDatabase", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore("todos", { keyPath: "id", autoIncrement: true });
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function saveToIndexedDB(todos) {
  openDatabase().then((db) => {
    const transaction = db.transaction(["todos"], "readwrite");
    const store = transaction.objectStore("todos");

    store.clear();
    todos.forEach((todo) => {
      store.add(todo);
    });
  });
}

function loadFromIndexedDB() {
  return new Promise((resolve, reject) => {
    openDatabase().then((db) => {
      const transaction = db.transaction(["todos"], "readonly");
      const store = transaction.objectStore("todos");
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  });
}

function loadTodos() {
  loadFromIndexedDB().then((cachedTodos) => {
    if (cachedTodos.length > 0) {
      renderTodos(cachedTodos);
    } else {
      fetch("/todos")
        .then((response) => response.json())
        .then((data) => {
          saveToIndexedDB(data);
          renderTodos(data);
        });
    }
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
      loadFromIndexedDB().then((cachedTodos) => {
        cachedTodos.push(todo);
        saveToIndexedDB(cachedTodos);
        renderTodos(cachedTodos);
        newTodoInput.value = "";
      });
    });
}
