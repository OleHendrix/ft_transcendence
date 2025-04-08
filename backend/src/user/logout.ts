import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';

export default async function logout(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post("/api/logout", async (req, res) =>
	{
		const { userId } = req.body as { userId: number };
	
		const user = await prisma.account.findUnique({ where: { id: userId } });
		if (!user) 
			return res.status(400).send({ error: 'User not found' })
		
		await prisma.account.update(
		{
				where: { id:     userId },
				data:  { online: false }
		}
		);

		res.send({ success: true });
	});
}