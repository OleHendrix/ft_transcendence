import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';

export default async function deleteTotp(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/auth/delete-totp',
		{
			preHandler: fastify.authenticate
		},
		async (request, reply) =>
	{
		const userId = request.account.sub;

		const account = await prisma.account.findUnique({ where: { id: userId } });

		if (!account || !account.totpSecret)
			return reply.status(404).send({ error: 'User not found or 2fa not enabled' });

		const updatedAccount = await prisma.account.update(
		{
			where: { id: userId },
			data:
			{
				totpSecret: null,
				twofa: false
			}
		});

		return reply.send({ success: true, account: updatedAccount });
	});
}