import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export default async function setupTotp(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/auth/setup-totp',
		{
			preHandler: fastify.authenticate
		},
		async (request, reply) =>
	{
		const userId = request.account.sub;

		const account = await prisma.account.findUnique({ where: { id: userId } });
		if (!account)
			return reply.code(404).send({ message: 'User not found'});

		const username = account.username;

		const secret = speakeasy.generateSecret({ name: `NextBall [${username}]` });

		await prisma.account.update(
			{
				where: { id: userId },
				data: { totpSecret: secret.base32 }
			});
		
		const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '',
		{
			color:
			{
				dark: '#FFFFFF', 
				light: '#ff914d'
			}
		});

		return reply.send({ qrCodeUrl });
	});
}
