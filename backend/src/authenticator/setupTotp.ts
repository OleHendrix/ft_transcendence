import { FastifyInstance } from "fastify";
import speakeasy from 'speakeasy';
import prisma from '../server';
import qrcode from 'qrcode';

export default async function setupTotp(fastify: FastifyInstance)
{
	fastify.post('/auth/setup-totp', async (req, reply) =>
	{
		const { username } = req.body as { username: string };

		const account = await prisma.account.findUnique({ where: { username } });
		if (!account)
			return reply.code(404).send({ message: 'User not found'});

		const secret = speakeasy.generateSecret({ name: 'MyApp (${username})' });

		await prisma.account.update(
			{
				where: { username },
				data: { totpSecret: secret.base32 }
			});
		
		const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '');

		return { qrCodeUrl };
	});
}
