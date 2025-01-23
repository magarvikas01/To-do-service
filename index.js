// Import the framework and instantiate it
import Fastify from 'fastify'
import cors from '@fastify/cors'
import routes from './routes/index.js'
import postgres from '@fastify/postgres'

const fastify = Fastify({
  logger: true
})

// database connection 
await fastify.register( postgres , {
  connectionString: `postgres://postgres:postgres@localhost:5432/local`})

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
