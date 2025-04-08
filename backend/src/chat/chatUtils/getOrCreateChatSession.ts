// utils/chatSession.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getOrCreateChatSession(senderId: number, receiverId: number) {
	if (receiverId === -1) {
		let chatSession = await prisma.chatSession.findFirst({
			where: { account1Id: 1, account2Id: 1 }
		});
		if (!chatSession) {
			chatSession = await prisma.chatSession.create({
				data: { account1Id: 1, account2Id: 1 }
			});
		}
		return chatSession;
	}

	let chatSession = await prisma.chatSession.findFirst({
		where: {
			OR: [
				{ account1Id: senderId, account2Id: receiverId },
				{ account1Id: receiverId, account2Id: senderId }
			]
		}
	});

	if (!chatSession) {
		chatSession = await prisma.chatSession.create({
			data: { account1Id: senderId, account2Id: receiverId }
		});
	}
	return chatSession;
}
