import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import fastifyCors from '@fastify/cors';
import bcrypt from 'bcryptjs';

const fastify = Fastify();
fastify.register(fastifyCors);
const prisma = new PrismaClient();

interface AddAccountRequest {
  username: string;
  email: string;
  password: string;
}

fastify.get('/', async (request, reply) => {
  return { message: 'Server is running!' };
});

fastify.post('/api/addaccount', async (request, reply) => {
  const { username, email, password }: AddAccountRequest = request.body as AddAccountRequest;

  const hashedPassword = await bcrypt.hash(password, 10);

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
      password: hashedPassword,
      wins: 0,
      draws: 0,
      loses: 0
    }
  });

  return reply.send({ success: true, account: newAccount });
});

fastify.get('/api/getplayers', async (request, reply) => {
  try {
    const players = await prisma.account.findMany();
    return reply.send({ success: true, players });
  } catch (error) {
    return reply.status(500).send({ error: 'Error getting players from database' });
  }
});

fastify.post('/api/login', async (request, reply) => {
  const { username, password }: { username: string; password: string } = request.body as any;

  // Check if the account exists
  const account = await prisma.account.findUnique({
    where: { username: username }
  });

  if (!account) {
    return reply.status(400).send({ error: 'Account not found' });
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, account.password);

  if (!isPasswordValid) {
    return reply.status(400).send({ error: 'Invalid password' });
  }

  // If the password matches, return the account details (or token, depending on your implementation)
  return reply.send({ success: true, account });
});

// Start the Fastify server
fastify.listen({ port: 5001, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});
