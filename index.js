import Fastify from 'fastify';
import cors from '@fastify/cors';
import routes from './routes/index.js';
import postgres from '@fastify/postgres';

const fastify = Fastify({
  logger: true, // Keep the logger for debugging
});

const start = async () => {
  try {
    await fastify.register(postgres, {
      connectionString: `postgres://postgres:postgres@0.0.0.0:5432/local`, // Ensure this is correct
    });
    console.log("Database connected successfully");

    await fastify.register(cors, {
      hook: 'preHandler',
      origin: '*', // Be more specific in production (e.g., your frontend URL)
    });
    console.log("CORS registered successfully");

    await fastify.register(routes);
    console.log("Routes registered successfully");

    await fastify.listen({ port: 5000, host: '0.0.0.0' }); // Listen on all interfaces
    console.log(`Server listening on port ${fastify.server.address().port}`);
  } catch (err) {
    console.error("Error during startup:", err); // More detailed error message
    process.exit(1); // Exit if something fails during startup
  }
};

start();
