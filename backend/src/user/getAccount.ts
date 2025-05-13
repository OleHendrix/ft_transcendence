import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';

export default async function getAccount(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.get('/api/get-account', async (request, reply) =>
	{
		const { requestedUser, username } = request.query as { requestedUser: string; username: string };
		const requestedUserId = parseInt(requestedUser);

		const user = await prisma.account.findUnique(
		{ 
			where:
			{
				username
			},
			include:
			{
				matches: true,
			}
		});
		let friendshipStatus = false;
		if (requestedUser !== username)
		{
			const friendship = await prisma.friendship.findFirst(
			{
				where:
				{
					OR: [{ requesterId: requestedUserId, receiverId: user?.id }, { requesterId: user?.id, receiverId: requestedUserId }]
				}
			})
			if (friendship)
				friendshipStatus = friendship.accepted;
		}
		// }
		if (user)
		{
			reply.send({ success: true, user, friendshipStatus });
		}
		else
			reply.status(404).send({ success: false, error: "Error in fetching account"});
	});
}