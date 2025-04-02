import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
	// Check if an admin account exists
	const admin = await prisma.account.findUnique({
		where: { id: 1 }
	});

	if (!admin) {
		//  Create an admin account with ID = 1
		const newAdmin = await prisma.account.create({
			data: {
				id: 1, // Enforce ID 1
				username: "Admin",
				email: "admin@example.com",
				password: "balzak",  // Hash this in production
				admin: true
			}
		});
		console.log("Admin account created:", newAdmin);
	} else {
		console.log("Admin account already exists");
	}

	const globalchat = await prisma.chatSession.findFirst({
		where: { account1Id: 1, account2Id: 1}
	});

	if (!globalchat){
		const newGlobalChat = await prisma.chatSession.create({
			data: {
				account1Id: 1,
				account2Id: 1
			}
		});
		console.log("GlobalChat created", newGlobalChat);
	} else {
		console.log("GlobalChat already exists");
	}
}

main()
	.catch((e) => console.error(e))
	.finally(() => prisma.$disconnect());
