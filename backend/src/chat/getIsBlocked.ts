import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

export default async function getIsBlocked(server: FastifyInstance, prisma: PrismaClient) {
	server.get('/api/is-blocked', async (request, reply) => {
		try {
			const { senderId, receiverId } = request.query as { senderId: string; receiverId: string; };
			const senderIdNum = parseInt(senderId, 10);
			const receiverIdNum = parseInt(receiverId, 10);
			
			const isBlocked = await prisma.block.findFirst({
				where: {
					OR:
					[
						{ blockerId: receiverIdNum, blockedId: senderIdNum },
						{ blockerId: senderIdNum, blockedId: receiverIdNum }
					]
				}
			});

			if (isBlocked) {
				// Determine who is the blocker
				const amIBlocker = isBlocked.blockerId === senderIdNum;
				return reply.send({ 
					success: true, 
					blocked: true, 
					amIBlocker 
				});
			}
			return reply.send({ success: true, blocked: false });
		} catch (error) {
			console.error("Error checking block status:", error);
			reply.status(500).send({ success: false, error: "Internal server error" });
		}
	});

}
