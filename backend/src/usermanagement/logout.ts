import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';

export default async function logout(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post("/api/logout", async (req, res) =>
	{
		const { username, password } = req.body as { username: string; password: string };
	
		const user = await prisma.account.findUnique({ where: { username } });
		if (!user) 
			return res.status(400).send({ error: 'User not found' })
		
		await prisma.account.update(
			{
				where: { username },
				data:  { online: false }
			}
		);

		res.send({ success: true });
	});
}