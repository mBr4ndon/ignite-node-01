const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'Mensagem do erro' });
  }

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todoExists = user.todos.find(td => td.id === id);

  if (!todoExists) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    });
  }

  todoExists.title = title;
  todoExists.deadline = deadline;

  return response.json(todoExists);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExists = user.todos.find(td => td.id === id);

  if (!todoExists) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    });
  }

  todoExists.done = true;

  return response.json(todoExists);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExists = user.todos.findIndex(td => td.id === id);

  if (todoExists === -1) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    });
  }

  user.todos.splice(todoExists, 1);

  return response.status(204).json();
});

module.exports = app;