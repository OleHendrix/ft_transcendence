import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';

import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';

const pump = promisify(pipeline);

export default async function upload(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.register(fastifyMultipart);
	fastify.register(fastifyStatic,
	{
		root: path.join(process.cwd(), 'uploads'),
		prefix: '/uploads/',
	});

	fastify.post('/api/upload', async (request, reply) =>
	{
		const parts = request.parts();
		let username = '';
		let filepath = '';

		for await (const part of parts)
		{
			if (part.type === 'file' && part.fieldname === 'image')
			{
				const filename = `${Date.now()}-${part.filename}`;
				const uploadPath = path.join(process.cwd(), '/uploads');
				if (!fs.existsSync(uploadPath))
					fs.mkdirSync(uploadPath, { recursive: true });
				filepath = path.join(uploadPath, filename);
				await pump(part.file, fs.createWriteStream(filepath));
			} 
			else if (part.type === 'field' && part.fieldname === 'username')
				username = part.value as string;
		}

		const updatedAccount = await prisma.account.update(
		{
			where:
			{
				username: username
			},
			data:
			{
				avatar: `/uploads/${path.basename(filepath)}`
			}

		})

		reply.send({ success: true, imageUrl: `https://ft-transcendence-6obq.onrender.com${updatedAccount.avatar}`});
	});
}