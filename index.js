const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const serveStaticFile = async (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, function(err, data) {
      if(err) reject(err);
      resolve(data);
    });
  });
}

const sendResponse = (response, content, contentType) => {
  response.writeHead(200, {"Content-Type": contentType});
  response.end(content);
}

const handleRequest = async (request, response) => {
  const url = request.url;

  if(request.method === "GET"){
    let content;
    let contentType;
    switch(url){
      case "/":
      case "/index.html":
        content = await serveStaticFile("www/index.html");
        contentType = "text/html";
        break;
      case "/script.js":
        content = await serveStaticFile("www/script.js");
        contentType = "text/javascript";
        break;
      case "/style.css":
        content = await serveStaticFile("www/style.css");
        contentType = "text/css";
        break;
      case "/tasks":
        const tasksFilePath = path.join(__dirname, 'tasks.json');
        const tasks = await serveStaticFile(tasksFilePath);
        content = tasks;
        contentType = "application/json";
        break;
      default: 
        content = "Ruta no v&aacutelida\r\n";
        contentType = "text/html";
    }

     sendResponse(response, content, contentType);
  } else if (request.method === "POST") {
    let body = '';
    request.on('data', chunk => {
      body += chunk.toString();
    });
    request.on('end', async () => {
      const tasksFilePath = path.join(__dirname, 'tasks.json');
      let tasks = await serveStaticFile(tasksFilePath);
      tasks = JSON.parse(tasks);
      const newTask = JSON.parse(body);
      newTask.id = tasks.length + 1;
      tasks.push(newTask);
      fs.writeFile(tasksFilePath, JSON.stringify(tasks), (err) => {
        if (err) {
          console.error(err);
          response.writeHead(500, {"Content-Type": "text/plain"});
          response.end("Error interno del servidor");
        } else {
          response.writeHead(201, {"Content-Type": "application/json"});
          response.end(JSON.stringify(newTask));
        }
      });
    });
  } else if (request.method === "PUT") {
  let body = '';
  request.on('data', chunk => {
  body += chunk.toString();
  });
  request.on('end', async () => {
  const tasksFilePath = path.join(__dirname, 'tasks.json');
  let tasks = await serveStaticFile(tasksFilePath);
  tasks = JSON.parse(tasks);
  const updatedTask = JSON.parse(body);
  const index = tasks.findIndex(task => task.id === updatedTask.id);
  if (index === -1) {
  response.writeHead(404, {"Content-Type": "text/plain"});
  response.end("No se encontró la tarea");
  } else {
  tasks[index] = updatedTask;
  fs.writeFile(tasksFilePath, JSON.stringify(tasks), (err) => {
  if (err) {
  console.error(err);
  response.writeHead(500, {"Content-Type": "text/plain"});
  response.end("Error interno del servidor");
  } else {
  response.writeHead(
  200,
  {"Content-Type": "application/json"}
  );
  response.end(JSON.stringify(updatedTask));
  }
  });
  }
  });
  } else if (request.method === "DELETE") {
  const taskId = url.split("/").pop();
  const tasksFilePath = path.join(__dirname, 'tasks.json');
  let tasks = await serveStaticFile(tasksFilePath);
  tasks = JSON.parse(tasks);
  const index = tasks.findIndex(task => task.id === parseInt(taskId));
  if (index === -1) {
  response.writeHead(404, {"Content-Type": "text/plain"});
  response.end("No se encontró la tarea");
  } else {
  tasks.splice(index, 1);
  fs.writeFile(tasksFilePath, JSON.stringify(tasks), (err) => {
  if (err) {
  console.error(err);
  response.writeHead(500, {"Content-Type": "text/plain"});
  response.end("Error interno del servidor");
  } else {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Tarea ${taskId} eliminada");
  }
  });
  }
} else{
response.writeHead(405, {"Content-Type": "text/html"});
response.write("M&eacutetodo ${request.method} no permitido!\r\n");
}
}

const server = http.createServer(handleRequest);
server.listen(PORT);
console.log("Servidor escuchando en el puerto ${PORT} ");