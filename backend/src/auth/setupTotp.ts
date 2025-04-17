import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { getDefaultHighWaterMark } from "stream";

export default async function setupTotp(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/auth/setup-totp', async (req, reply) =>
	{
		const { username } = req.body as { username: string };
		console.log('username:', username);

		const account = await prisma.account.findUnique({ where: { username } });
		if (!account)
			return reply.code(404).send({ message: 'User not found'});

		const secret = speakeasy.generateSecret({ name: `NextBall [${username}]` });

		await prisma.account.update(
			{
				where: { username },
				data:  { totpSecret: secret.base32 }
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

export async function verifySetupTotp(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/auth/verify-setup-totp', { preValidation: [fastify.authenticate] }, async (request, reply) =>
	{
		await request.jwtVerify();
		const userId = request.account.sub;

		const { token: totpToken } = request.body as { token: string};

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
			data:  { twofaEnabled: true },
		});

		return reply.send({ success: true, message: '2fa enabled ouweeee'})
	});
}