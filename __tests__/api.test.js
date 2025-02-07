import { describe, expect, test, beforeAll, afterAll, jest } from '@jest/globals';
import Fastify from 'fastify';
import postgres from '@fastify/postgres';
import jwt from '@fastify/jwt';
import routes from '../routes/todoRoutes.js';
import todoServiceFactory from '../services/todoService.js';

// Create a mock implementation of todoService
const mockTodoService = {
  createUserIfNotExists: jest.fn().mockResolvedValue(undefined),
  addTodo: jest.fn().mockResolvedValue({ 
    id: 1, 
    todo: 'New todo', 
    user_id: 'test-user-id' 
  }),
  getTodos: jest.fn().mockResolvedValue([{ 
    id: 1, 
    todo: 'Test todo' 
  }]),
  getTotalTodosCount: jest.fn().mockResolvedValue(1),
  updateTodo: jest.fn().mockResolvedValue({
    id: 1,
    todo: 'Updated todo',
    user_id: 'test-user-id'
  }),
  deleteTodo: jest.fn().mockResolvedValue(true)
};

// Mock the todoService module
jest.mock('../services/todoService.js', () => {
  return jest.fn(() => mockTodoService);
});

describe('Todo API Routes', () => {
  let app;

  beforeAll(async () => {
    app = Fastify();

    // Register Fastify JWT
    await app.register(jwt, {
      secret: 'test-secret'
    });

    // Add authentication decorator
    app.decorate('authenticate', async (request, reply) => {
      request.user = {
        sub: 'test-user-id',
        preferred_username: 'test-user',
        email: 'test@example.com'
      };
    });

    // Register routes
    await app.register(routes);

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test('GET /api/todos returns empty list when no todos exist', async () => {
    mockTodoService.getTodos.mockResolvedValueOnce([]);
    mockTodoService.getTotalTodosCount.mockResolvedValueOnce(0);
  
    const response = await app.inject({
      method: 'GET',
      url: '/api/todos',
      query: { page: '1', limit: '6' },
    });
  
    expect(response.statusCode).toBe(200);  // Changed from 201 to 200
    expect(JSON.parse(response.payload)).toEqual({
      todos: [],
      totalCount: 0,  // Added totalCount
      currentPage: 1,
      totalPages: 0
    });
  });

  test('POST /api/todos creates new todo', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: { todo: 'New todo' },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ 
      id: 1, 
      todo: 'New todo', 
      user_id: 'test-user-id' 
    });
  });

  test('PUT /api/todos/:id updates todo', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/api/todos/1',
      payload: { todo: 'Updated todo' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      id: 1,
      todo: 'Updated todo',
      user_id: 'test-user-id'
    });
  });

  test('PUT /api/todos/:id returns 404 for non-existent todo', async () => {
    mockTodoService.updateTodo.mockResolvedValueOnce(null);

    const response = await app.inject({
      method: 'PUT',
      url: '/api/todos/999',
      payload: { todo: 'Updated todo' },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'Todo not found' });
  });

  test('DELETE /api/todos/:id deletes todo', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/api/todos/1',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ message: 'Todo deleted successfully' });
  });

  test('DELETE /api/todos/:id returns 404 for non-existent todo', async () => {
    mockTodoService.deleteTodo.mockResolvedValueOnce(false);

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/todos/999',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'Todo not found' });
  });
});