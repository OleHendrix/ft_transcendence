import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import speakeasy from 'speakeasy';

export default async function verifyTotp(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/auth/verify-totp', async (req, reply) =>
	{
		const { token: totpToken, jwt: tempJwt } = req.body as { token: string, jwt: string };
		try
		{
			const decoded = fastify.jwt.verify(tempJwt) as { sub: number };
			const userId = decoded.sub;

			const account = await prisma.account.findUnique({ where: { id: userId } });
			if (!account || !account.totpSecret)
				return reply.code(400).send({ success: false, message: 'Totp not setup' });

			const isValid = speakeasy.totp.verify(
				{
					secret: account.totpSecret,
					encoding: 'base32',
					token: totpToken,
					window: 1,
				}
			);
	
			if (!isValid)
				return reply.code(401).send({ success: false, message: 'Verkeerde token gek' });

			await prisma.account.update({
				where: { id: userId },
				data:  { online: true,  twofaEnabled: true },
			});

			const finalToken = fastify.jwt.sign(
				{
					sub: account.id,
					username: account.username,
					email: account.email,
					twofa: true,
				},
				{ expiresIn: '1h' }
			);

			return reply.send({ success: true, token: finalToken, user: account });
		}
		catch (err)
		{
			reply.code(401).send({ message: 'Unauthorized' });
		}
	});
}