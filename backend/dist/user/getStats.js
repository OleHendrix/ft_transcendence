"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getStats;
function getStats(fastify, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/get-stats', (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.body;
            console.log('id:', userId);
            const stats = yield prisma.account.findUnique({
                where: { id: userId },
                select: { wins: true, draws: true, losses: true, elo: true }
            });
            if (!stats)
                return reply.status(404).send({ error: 'User not found' });
            return reply.status(200).send({ stats });
        }));
    });
}
