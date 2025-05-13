import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

interface updateAccountRequest
{
	prev_username: string;
	username: string;
	email: string;
	password: string;
}

export default async function updateAccount(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/update-account', async (request, reply) =>
	{
		const { prev_username, username, email, password } = request.body as updateAccountRequest;
		const hashedPassword = await bcrypt.hash(password, 10);
		try
		{
			const updateData: any =
			{ 
           		username: username,
            	email: email
			};

			if (password && password !== '')
			{
            	const hashedPassword = await bcrypt.hash(password, 10);
            	updateData.password = hashedPassword;
			}
            const updatedAccount = await prisma.account.update(
			{
                where:
				{ 
                    username: prev_username 
                },
                data: updateData
            });
			return reply.send(
			{ 
                success: true,
                user:
				{
                    username: updatedAccount.username,
                    email: updatedAccount.email,
					password: updatedAccount.password
                }
            });
		}
		catch (error)
		{
			return reply.status(500).send({success: false, error: 'Account deletion failed' });
		}
	});
}