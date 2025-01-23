// Import the framework and instantiate it
import Fastify from 'fastify'
import cors from '@fastify/cors'


const fastify = Fastify({
  logger: true
})

await fastify.register(cors, {
  hook: 'preHandler',
  origin: '*'
})

// Declare a route
fastify.get('/', async function handler (request, reply) {
  return { hello: 'world' }
})

// Run the server!
try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
