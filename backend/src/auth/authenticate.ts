import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { JwtPayload } from "../types/fastify";


export default async function authenticate(fastify: FastifyInstance)
{
	console.log('registering authenticate');
	fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply)
	{
		try
		{
			const decoded = await request.jwtVerify<JwtPayload>();
			request.account = decoded;
		}
		catch (err)
		{
			console.error("JWT error:", err); 
			reply.status(401).send('Unauthorized');
		}
	});
}	