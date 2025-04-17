import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';

const authenticatePlugin: FastifyPluginAsync = async (fastify) =>
{
	fastify.decorate('Authenticate', async function (request: FastifyRequest, reply: FastifyReply): Promise<void>
	{
		try
		{
			await request.jwtVerify();
		}
		catch (err)
		{
			reply.code(401).send({ message: 'Unauthorized' });
		}
	})
};

export default authenticatePlugin;