import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import fastifyCors from '@fastify/cors';

// Initialize Fastify
const fastify = Fastify();

// Enable CORS
fastify.register(fastifyCors);

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define a type for the request body structure
interface AddAccountRequest {
  username: string;
  email: string;
  password: string;
}


// Root endpoint
fastify.get('/', async (request, reply) => {
  return { message: 'Server is running!' };
});

fastify.post('/api/addaccount', async (request, reply) => {
  const { username, email, password }: AddAccountRequest = request.body as AddAccountRequest;

  const existingAccount = await prisma.account.findFirst({
    where: {
      OR: [
        { username: username },
        { email: email }
      ]
    }
  });

  if (existingAccount) {
    if (existingAccount.username === username) {
      return reply.status(400).send({ error: 'Username already exists' });
    } else if (existingAccount.email === email) {
      return reply.status(400).send({ error: 'Email already exists' });
    }
  }

  const newAccount = await prisma.account.create({
    data: {
      username: username,
      email: email,
      password: password,
      wins: 0,
      draws: 0,
      loses: 0
    }
  });

  return reply.send({ success: true, account: newAccount });
});


// GET endpoint to get all players
fastify.get('/api/getplayers', async (request, reply) => {
  try {
    const players = await prisma.account.findMany();
    return reply.send({ success: true, players });
  } catch (error) {
    return reply.status(500).send({ error: 'Error getting players from database' });
  }
});

// Start the Fastify server
fastify.listen({ port: 5001, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});
