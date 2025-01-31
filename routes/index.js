export default async function (fastify) {
  fastify.get('/api/todos', async (req, reply) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const result = await fastify.pg.query(
        'SELECT id, todo, created_at, updated_at FROM todo.todo ORDER BY id ASC LIMIT $1 OFFSET $2',
        [limit, offset]
      );

      const totalCountQuery = await fastify.pg.query('SELECT COUNT(*) FROM todo.todo');
      const totalCount = totalCountQuery.rows[0].count;

      reply.send({
        todos: result.rows,
        totalCount: totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
      });
    } catch (err) {
      fastify.log.error(err.message);
      reply.status(500).send({ error: 'Server error' });
    }
  });

  const isValidTodo = (todo) => {
    if (!todo || todo.trim().length === 0) {
        return { valid: false, message: 'Todo cannot be empty' };
    }

    if (todo.trim().length > 200) {
        return { valid: false, message: 'Todo is too long' };
    }

    // Regular expression to allow only letters, spaces, and a few punctuation marks
    const regex = /^[a-zA-Z\s.,?!-]+$/; // Allows letters, spaces, and some punctuation

    if (!regex.test(todo)) {
        return { valid: false, message: 'Todo contains invalid characters. Only letters, spaces, and some punctuation are allowed.' };
    }

    return { valid: true };
};

fastify.post('/api/todos', async (req, reply) => {
    try {
        const { todo } = req.body;
        const validationResult = isValidTodo(todo);

        if (!validationResult.valid) {
            return reply.status(400).send({ error: validationResult.message });
        }

        const result = await fastify.pg.query(
            'INSERT INTO todo.todo (todo) VALUES ($1) RETURNING *',
            [todo]
        );
        reply.send(result.rows[0]);
    } catch (err) {
        fastify.log.error(err.message);
        reply.status(500).send({ error: 'Server error' });
    }
});

fastify.put('/api/todos/:id', async (req, reply) => {
    try {
        const { id } = req.params;
        const { todo } = req.body;
        const validationResult = isValidTodo(todo);

        if (!validationResult.valid) {
            return reply.status(400).send({ error: validationResult.message });
        }

        const result = await fastify.pg.query(
            'UPDATE todo.todo SET todo = $1 WHERE id = $2 RETURNING *',
            [todo, id]
        );

        if (result.rows.length === 0) {
            return reply.status(404).send({ error: 'Todo not found' });
        }

        reply.send(result.rows[0]);
    } catch (err) {
        fastify.log.error(err.message);
        reply.status(500).send({ error: 'Server error' });
    }
});


  fastify.delete('/api/todos/:id', async (req, reply) => {
    try {
      const { id } = req.params;

      const result = await fastify.pg.query('DELETE FROM todo.todo WHERE id = $1', [id]);

      if (result.rowCount === 0) {
        return reply.status(404).send({ error: 'Todo not found' });
      }

      reply.send({ message: 'Todo deleted successfully' });
    } catch (err) {
      fastify.log.error(err.message);
      reply.status(500).send({ error: 'Server error' });
    }
  });
}