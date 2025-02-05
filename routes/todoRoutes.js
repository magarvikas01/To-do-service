import todoControllerFactory from '../controllers/todoController.js';

export default async function (fastify) {
  const todoController = todoControllerFactory(fastify);

  fastify.get('/api/todos', { onRequest: [fastify.authenticate] }, todoController.getTodos);
  fastify.post('/api/todos', { onRequest: [fastify.authenticate] }, todoController.createTodo);
  fastify.put('/api/todos/:id', { onRequest: [fastify.authenticate] }, todoController.updateTodo);
  fastify.delete('/api/todos/:id', { onRequest: [fastify.authenticate] }, todoController.deleteTodo);
}