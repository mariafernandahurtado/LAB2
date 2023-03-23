//Script del usuario

let taskList = [];

const loadTasks = () => {
  fetch("/tasks.json")
    .then(response => response.json())
    .then(data => {
      console.log(data); // mostrar los datos cargados en la consola
      taskList = data.tasks;
      renderTasks();
    })
    .catch(error => console.error(error));
}


const addTask = (name) => {
  const newTask = {
    id: taskList.length + 1,
    name: name,
    done: false
  };
  taskList.push(newTask);
  renderTasks();
}

const removeTask = (id) => {
  const taskIndex = taskList.findIndex(task => task.id === id);
  if (taskIndex !== -1) {
    const taskElement = document.querySelector(`[data-id="${id}"]`);
    taskElement.classList.remove("done"); // eliminar la clase "done"
    taskList.splice(taskIndex, 1);
    renderTasks();
  }
}


const toggleDone = (id) => {
  const taskIndex = taskList.findIndex(task => task.id === id);
  if (taskIndex !== -1) {
    const task = taskList[taskIndex];
    task.done = !task.done;
    const taskElement = document.querySelector(`[data-id="${id}"]`);
    taskElement.classList.toggle("done", task.done); // agregar o quitar la clase "done"
    renderTasks();
  }
}


const startTimer = (id) => {
  let timeoutId = setTimeout(() => {
    toggleDone(id);
    clearTimeout(timeoutId);
  }, 2000);

}

const stopTimer = () => {
  clearTimeout(timeoutId);
}

const handleSwipe = (event) => {
  const taskElement = event.target.closest(".task");
  const id = parseInt(taskElement.dataset.id);
  removeTask(id);
}

const renderTasks = () => {
  const taskListElement = document.querySelector("#task-list");
  taskListElement.innerHTML = "";
  taskList.forEach(task => {
    const taskElement = document.createElement("li");
    taskElement.classList.add("task");
    taskElement.dataset.id = task.id;
    taskElement.innerHTML = `
      <span class="task-name ${task.done ? "done" : ""}">${task.name}</span>
      <button class="remove-task">X</button>
    `;
    taskElement.addEventListener("click", () => startTimer(task.id));
    taskElement.addEventListener("touchstart", () => startTimer(task.id));
    taskElement.addEventListener("touchend", stopTimer);
    taskElement.addEventListener("touchcancel", stopTimer);
    taskElement.addEventListener("swiperight", handleSwipe);
    const removeButton = taskElement.querySelector(".remove-task");
    removeButton.addEventListener("click", () => removeTask(task.id));
    taskListElement.appendChild(taskElement);
  });
}

const addButton = document.querySelector("#fab-add");
const taskNameInput = document.querySelector("#task-name");


//Para añadir una nueva tarea al hacer click en el boton +
addButton.addEventListener("click", () => {
  const taskName = taskNameInput.value.trim();
  if (taskName.length > 0) {
    addTask(taskName);
    taskNameInput.value = "";
  }
});

loadTasks();
