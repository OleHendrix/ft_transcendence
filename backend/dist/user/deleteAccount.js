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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = deleteAccount;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function deleteAccount(fastify, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/delete-account', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { username } = request.body;
            try {
                const account = yield prisma.account.findUnique({ where: { username } });
                if ((account === null || account === void 0 ? void 0 : account.avatar) && account.avatar !== "") {
                    const filePath = path_1.default.join(process.cwd(), account.avatar);
                    if (fs_1.default.existsSync(filePath))
                        fs_1.default.unlinkSync(filePath);
                }
                const deleted = yield prisma.account.delete({ where: { username } });
                console.log(deleted);
                return reply.send({ success: true });
            }
            catch (error) {
                return reply.status(500).send({ error: 'Account deletion failed' });
            }
        }));
    });
}
