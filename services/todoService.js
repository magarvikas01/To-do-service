export default (fastify) => ({
    createUserIfNotExists: async (userId, username, email) => {
      await fastify.pg.query(
        `INSERT INTO todo.users (id, username, email)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO NOTHING`,
        [userId, username, email]
      );
    },
  
    getTodos: async (userId, limit, offset) => {
      const result = await fastify.pg.query(
        `SELECT * FROM todo.todos WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      return result.rows;
    },
  
    getTotalTodosCount: async (userId) => {
      const result = await fastify.pg.query(
        'SELECT COUNT(*) FROM todo.todos WHERE user_id = $1',
        [userId]
      );
      return parseInt(result.rows[0].count, 10);
    },
  
    addTodo: async (todo, userId) => {
      const result = await fastify.pg.query(
        `INSERT INTO todo.todos (todo, user_id) VALUES ($1, $2) RETURNING *`,
        [todo, userId]
      );
      return result.rows[0];
    },
  
    updateTodo: async (todo, id, userId) => {
      const result = await fastify.pg.query(
        `UPDATE todo.todos SET todo = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
        [todo, id, userId]
      );
      return result.rows.length ? result.rows[0] : null;
    },
  
    deleteTodo: async (id, userId) => {
      const result = await fastify.pg.query(
        'DELETE FROM todo.todos WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      return result.rowCount > 0;
    }
  });
  
  