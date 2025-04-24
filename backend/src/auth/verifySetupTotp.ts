import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';
import speakeasy from 'speakeasy';

export default async function verifySetupTotp(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/auth/verify-setup-totp',
		{
			preHandler: fastify.authenticate
		},
		async (request, reply) =>
	{
		const username  = request.account.username;
		const { token } = request.body as { token: string; };

		console.log("checking 2fa from:", username, "token:", token);
		const account = await prisma.account.findUnique({ where: { username } });

		if (!account || !account.totpSecret)
			return reply.code(400).send({ success: false, message: 'TOTP is not setup' });

		const isValid = speakeasy.totp.verify(
			{
				secret: account.totpSecret,
				encoding: 'base32',
				token,
				window: 1,
			}
		);

		if (!isValid)
			return reply.code(401).send({ success: false, message: 'Verkeerde token gek' });

		const updatedAccount = await prisma.account.update(
		{
			where: { username },
			data:  { twofa: true}
		})

		return reply.send({ success: true, account: updatedAccount });
	});
}
