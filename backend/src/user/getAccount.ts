import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';

export default async function getAccount(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.get('/api/get-account', async (request, reply) =>
	{
		const { requestedUser, username } = request.query as { requestedUser: string; username: string };
		const requestedUserId = parseInt(requestedUser);

		let user = await prisma.account.findUnique(
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
		if (user)
		{
			if (user.avatar && user.avatar !== '')
				user.avatar = `http://${request.hostname}:5001${user.avatar}`;
			reply.send({ success: true, user, friendshipStatus });
		}
		else
			reply.status(404).send({ success: false, error: "Error in fetching account"});
	});
}