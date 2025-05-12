import { FastifyInstance } from "fastify/fastify";
import { PrismaClient } from ".prisma/client";

import addAccount from "./addAccount";
import deleteAccount from "./deleteAccount";
import getAccount from "./getAccount";
import getAccounts from "./getAccounts";
import upload from "./upload";
import checkValidation from "./checkValidation";
import login from "./login";
import cleanup from "./cleanup";
import logout from "./logout";
import updateAccount from "./updateAccount";
import getAccountData from "./getAccountData";

export async function setUpAccount(fastify: FastifyInstance, prisma: PrismaClient)
{
	await addAccount(fastify, prisma);
	await deleteAccount(fastify, prisma);
	await getAccount(fastify, prisma);
	await getAccounts(fastify, prisma);
	await getAccountData(fastify, prisma);
	await upload(fastify, prisma);
	await checkValidation(fastify, prisma);
	await login(fastify, prisma);
	await logout(fastify, prisma);
	await updateAccount(fastify, prisma);
}