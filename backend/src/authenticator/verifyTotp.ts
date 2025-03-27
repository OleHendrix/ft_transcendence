import { FastifyInstance } from 'fastify';
import speakeasy from 'speakeasy';
import prisma from '../server';

export default async function verifyTotp(fastify: FastifyInstance)
{
	fastify.post('/api/auth/verify-totp', async (req, reply) =>
	{
		const { username, token } = req.body as { username: string; token: string; };
		console.log("checking 2fa from:", username, "token:", token);
		const account = await prisma.account.findUnique({ where: { username } });

		if (!account || !account.totpSecret)
			return reply.code(400).send({ success: false, message: 'TOTP is not setup' });

		console.log("found user with totp:", username);
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
		console.log("authorized:", username);
		return { success: true, user: account };
	});
}