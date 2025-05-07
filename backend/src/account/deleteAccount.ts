import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

export default async function deleteAccount(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/delete-account', async (request, reply) =>
	{
		const { username } = request.body as { username: string };
		try
		{
			const account = await prisma.account.findUnique({ where: { username } });
			if (account?.avatar && account.avatar !== "")
			{
				const filePath = path.join(process.cwd(), account.avatar);
				if (fs.existsSync(filePath))
					fs.unlinkSync(filePath); 
			}
			const deleted = await prisma.account.delete({ where: { username } });
			console.log(deleted);
			return reply.send({ success: true});
		}
		catch (error)
		{
			return reply.status(500).send({ error: 'Account deletion failed' });
		}
	});
}