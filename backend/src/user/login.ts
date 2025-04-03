import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

export default async function login(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/login', async (req, res) =>
	{
		const { username, password } = req.body as { username: string; password: string };
	
		const user = await prisma.account.findUnique({ where: { username } });
		if (!user) return res.status(400).send({ error: 'User not found' })
		
		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword) return res.status(401).send({ error: 'Incorrect password'});

		await prisma.account.update ({
				where: { username },
				data:  { online: true }
		});

		const token = fastify.jwt.sign({ username: user.username, email: user.email}, { expiresIn: '1h'});
		res.send({ success: true, token, user});
	});
}