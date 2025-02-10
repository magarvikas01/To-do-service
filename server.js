import Fastify from 'fastify';
import cors from '@fastify/cors';
import postgres from '@fastify/postgres';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import todoRoutes from './routes/todoRoutes.js';
import authenticate from './middleware/authenticate.js';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

dotenv.config();

const fastify = Fastify({ logger: true });

await fastify.register(swagger, {
  swagger: {
    info: {
      title: 'Todo API',
      description: 'API documentation for the Todo App',
      version: '1.0.0',
    },
    host: 'localhost:5000',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      BearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Enter JWT token as "Bearer <your-token>"',
      },
    },
    security: [{ BearerAuth: [] }], 
  },
});

fastify.register(swaggerUI, {
  routePrefix: '/docs', 
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => swaggerObject,
  transformSpecificationClone: true
});

// Database Connection
fastify.register(postgres, { connectionString: process.env.DATABASE_URL });

// CORS Configuration
fastify.register(cors, {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// JWT Authentication using Keycloak
const publicKey = `-----BEGIN PUBLIC KEY-----\n${process.env.KEYCLOAK_PUBLIC_KEY}\n-----END PUBLIC KEY-----`;

fastify.register(jwt, {
  secret: {
    public: publicKey,
    algorithm: 'RS256'
  },
  decode: { complete: true },
  verify: {
    algorithms: ['RS256'],
    issuer: process.env.KEYCLOAK_ISSUER,
  }
});

// Register Middleware
fastify.decorate("authenticate", authenticate(fastify));

// Register Routes
fastify.register(todoRoutes);

// Start Server
const start = async () => {
  try {
    await fastify.listen({ port: 5000, host: '0.0.0.0' });
    console.log('🚀 Server running on port 5000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
