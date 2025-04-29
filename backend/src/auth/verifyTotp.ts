import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import speakeasy from 'speakeasy';

export default async function verifyTotp(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/auth/verify-totp',
		{
			preHandler: fastify.authenticate
		},
		async (request, reply) =>
	{
		const userId = request.account.sub;
		const { token } = request.body as { token: string; };

		console.log("checking 2fa from:", userId, "token:", token);
		const account = await prisma.account.findUnique({ where: { id: userId } });

		if (!account || !account.totpSecret)
			return reply.code(400).send({ success: false, message: 'TOTP is not setup' });

		console.log("found user with totp:", userId);
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

		await prisma.account.update(
		{
			where: { id: userId },
			data:  { online: true}
		})

		const finalToken = fastify.jwt.sign({
			sub: account.id,
			username: account.username,
			email: account.email,
			twofaRequired: true,
		},
		{ expiresIn: '1h' });

		const refreshToken = fastify.jwt.sign({
			sub: account.id,
		},
		{ expiresIn: '7d' });

		console.log("authorized:", userId);
		return reply.send({ success: true, token: finalToken, refreshToken, account});
	});
}