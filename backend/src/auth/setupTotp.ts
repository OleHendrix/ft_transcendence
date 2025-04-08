import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export default async function setupTotp(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/auth/setup-totp', async (req, reply) =>
	{
		const { username } = req.body as { username: string };
		console.log('username:', username);

		const account = await prisma.account.findUnique({ where: { username } });
		if (!account)
			return reply.code(404).send({ message: 'User not found'});

		const secret = speakeasy.generateSecret({ name: `NextBall: ${username}` });

		await prisma.account.update(
			{
				where: { username },
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
