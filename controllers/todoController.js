import todoServiceFactory from '../services/todoService.js';

export default (fastify) => {
  const todoService = todoServiceFactory(fastify);

  const getTodos = async (request, reply) => {
    try {
      const { page = 1, limit = 6 } = request.query;
      const offset = (page - 1) * limit;
      const userId = request.user.sub;

      await todoService.createUserIfNotExists(userId, request.user.preferred_username, request.user.email);

      const todos = await todoService.getTodos(userId, limit, offset);
      const totalCount = await todoService.getTotalTodosCount(userId);

      reply.send({
        todos,
        totalCount:todos[0].total_count,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalCount / limit),
      });
    } catch (err) {
      console.error("Error fetching todos:", err.message);
      reply.status(500).send({ error: 'Server error' });
    }
  };

  const createTodo = async (request, reply) => {
    try {
      const { todo } = request.body;
      const userId = request.user.sub;

      const newTodo = await todoService.addTodo(todo, userId);
      reply.status(201).send(newTodo);
    } catch (err) {
      console.error("Error creating todo:", err.message);
      reply.status(500).send({ error: 'Server error' });
    }
  };

  const updateTodo = async (request, reply) => {
    try {
      const { id } = request.params;
      const { todo } = request.body;
      const userId = request.user.sub;

      const updatedTodo = await todoService.updateTodo(todo, id, userId);
      if (!updatedTodo) return reply.status(404).send({ error: 'Todo not found' });

      reply.send(updatedTodo);
    } catch (err) {
      console.error("Error updating todo:", err.message);
      reply.status(500).send({ error: 'Server error' });
    }
  };

  const deleteTodo = async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.sub;

      const deleted = await todoService.deleteTodo(id, userId);
      if (!deleted) return reply.status(404).send({ error: 'Todo not found' });

      reply.send({ message: 'Todo deleted successfully' });
    } catch (err) {
      console.error("Error deleting todo:", err.message);
      reply.status(500).send({ error: 'Server error' });
    }
  };

  return {
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo,
  };
};