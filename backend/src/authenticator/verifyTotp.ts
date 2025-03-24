import { FastifyInstance } from 'fastify';
import speakeasy from 'speakeasy';
import prisma from '../server';

export default async function verifyTotp(fastify: FastifyInstance)
{
	fastify.post('/auth/verify-totp', async (req, reply) =>
	{
		const { username, token } = req.body as { username: string; token: string; };

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
		return { success: true };
	});
}