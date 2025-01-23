// routes/root.js
export default async function (fastify) {
    fastify.get('/', async (req, reply) => {
        try {
          const result = await fastify.pg.query('SELECT * FROM todo.todo ORDER BY id ASC');
          reply.send(result.rows); 
        } catch (err) {
          fastify.log.error(err.message);
          reply.status(500).send({ error: 'Server error' });
        }
      });
}