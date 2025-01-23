// routes/root.js
export default async function (fastify) {
  fastify.get('/', async function handler (request, reply) {
    return { hello: 'world' }
  })
}