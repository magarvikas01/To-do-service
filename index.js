// Import the framework and instantiate it
import Fastify from 'fastify'
import cors from '@fastify/cors'
import routes from './routes/index.js'


const fastify = Fastify({
  logger: true
})

await fastify.register(cors, {
  hook: 'preHandler',
  origin: '*'
})

// Declare a route
await fastify.register(routes) 


// Run the server!
try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
