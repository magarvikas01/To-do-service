// routes/root.js
export default async function (fastify) {
    fastify.get('/api/todos', async (req, reply) => {
        try {
          const result = await fastify.pg.query('SELECT * FROM todo.todo ORDER BY id ASC');
          reply.send(result.rows); 
        } catch (err) {
          fastify.log.error(err.message);
          reply.status(500).send({ error: 'Server error' });
        }
      });

      fastify.post('/api/todos', async (req, reply) => {
        try {
          const { todo } = req.body;
    
          // Check if todo is present and not empty
          if (!todo || todo.trim() === '') {
            return reply.status(400).send({ error: 'Todo cannot be empty' });
          }
    
          const result = await fastify.pg.query('INSERT INTO todo.todo (name) VALUES ($1) RETURNING *', [todo]);
          reply.send(result.rows[0]);
        } catch (err) {
          fastify.log.error(err.message);
          reply.status(500).send({ error: 'Server error' })
        }
      });

      fastify.put('/api/todos/:id', async (req, reply) => {
        try {
          const { id } = req.params;
          const { todo } = req.body;
    
          // Check if todo is present and not empty
          if (!todo || todo.trim() === '') {
            return reply.status(400).send({ error: 'Todo cannot be empty' });
          }
    
          const result = await fastify.pg.query(
            'UPDATE todo.todo SET name = $1 WHERE id = $2 RETURNING *',
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