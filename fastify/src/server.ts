import Fastify from 'fastify';
import sqlite3 from 'sqlite3';
import fastifyCors from '@fastify/cors';


// Initialize Fastify
const fastify = Fastify();

// Enable CORS
fastify.register(fastifyCors);

// Create the SQLite3 database connection
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create the 'accounts' table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  wins INTEGER,
  draws INTEGER,
  loses INTEGER
)`);

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

// POST endpoint to add a new account
fastify.post('/api/addaccount', async (request, reply) => {
  const { username, email, password }: AddAccountRequest = request.body as AddAccountRequest;

  return new Promise((resolve, reject) => {
    db.get<{ username?: string; email?: string }>(
      'SELECT username, email FROM accounts WHERE username = ? OR email = ?',
      [username, email],
      (err, row) => {
        if (err) {
          reject(reply.status(500).send({ error: 'Error fetching database data' }));
        } else if (row) {
          if (row.username === username) {
            reject(reply.status(400).send({ error: 'Username already exists' }));
          } else if (row.email === email) {
            reject(reply.status(400).send({ error: 'Email already exists' }));
          }
        } else {
          db.run(
            'INSERT INTO accounts (username, email, password, wins, draws, loses) VALUES (?, ?, ?, 0, 0, 0)',
            [username, email, password],
            (err) => {
              if (err) {
                console.log(err.message);
                reject(reply.status(500).send({ error: 'Could not add account to database' }));
              } else {
                resolve(reply.send({ success: true }));
              }
            }
          );
        }
      }
    );
  });
});

// GET endpoint to get all players
fastify.get('/api/getplayers', async (request, reply) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM accounts', (err, rows) => {
      if (err) {
        reject(reply.status(500).send({ error: 'Error getting players from database' }));
      } else {
        resolve(reply.send({ success: true, players: rows }));
      }
    });
  });
});

// Start the Fastify server with options
// const PORT = 5001;
fastify.listen({ port: 5001, host: '0.0.0.0' }, (err, address) => {
	if (err) {
	  console.error(err);
	  process.exit(1);
	}
	console.log(`Server running at ${address}`);
  });

// import sqlite3 from "sqlite3";
// import fastifyJwt from '@fastify/jwt'; //handles auth using json web tokens
// import fastifyBcrypt from 'fastify-bcrypt'; // password encryption
// import { PrismaClient } from '@prisma/client'; // mapping for database interaction 


// //init 
// const fastify = Fastify({ logger: true });
// const prisma = new PrismaClient();


// fastify.register(fastifyJwt, { secret: 'supersecret' });
// fastify.register(fastifyBcrypt);

// fastify.decorate("authenticate", async (request, reply) => {
//   try {
//     await request.jwtVerify();
//   } catch (err) {
//     reply.send(err);
//   }
// });

// //  User Signup
// fastify.post('/signup', async (request, reply) => {
//   const { email, password } = request.body;

//   const existingUser = await prisma.user.findUnique({ where: { email } });
//   if (existingUser) return reply.code(400).send({ error: 'User already exists' });

//   const hashedPassword = await fastify.bcrypt.hash(password);

//   const user = await prisma.user.create({
//     data: { email, password: hashedPassword },
//   });

//   reply.send({ message: 'User created successfully' });
// });

// //  User Login
// fastify.post('/login', async (request, reply) => {
//   const { email, password } = request.body;

//   const user = await prisma.user.findUnique({ where: { email } });
//   if (!user) return reply.code(400).send({ error: 'Invalid email or password' });

//   const isValid = await fastify.bcrypt.compare(password, user.password);
//   if (!isValid) return reply.code(400).send({ error: 'Invalid email or password' });

//   const token = fastify.jwt.sign({ id: user.id, email: user.email });

//   reply.send({ token });
// });

// //  Protected Route (Example)
// fastify.get('/profile', { preHandler: [fastify.authenticate] }, async (request, reply) => {
//   reply.send({ message: 'Welcome to your profile!', user: request.user });
// });

// // Start Server
// fastify.listen({ port: PORT }, (err, address) => {
//   if (err) {
//     console.error(err);
//     process.exit(1);
//   }
//   console.log(`Server running at ${address}`);
// });