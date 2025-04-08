// utils/chatSession.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getBlockedUserIds( senderId: number)
{
	const senderBlocks = await prisma.account.findUnique({
		where: { id: senderId },
		include: {
			Blocks: {
				select: {
					blockedId: true
				}
			}
		}
	});

	const blockedUserIds = senderBlocks?.Blocks.map(b => b.blockedId) || [];
	return (blockedUserIds);
}

