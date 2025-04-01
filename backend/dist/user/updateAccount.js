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
exports.default = updateAccount;
const bcrypt_1 = __importDefault(require("bcrypt"));
function updateAccount(fastify, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/update-account', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { prev_username, username, email, password } = request.body;
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            try {
                const updateData = {
                    username: username,
                    email: email
                };
                if (password && password !== '') {
                    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                    updateData.password = hashedPassword;
                }
                const updatedAccount = yield prisma.account.update({
                    where: {
                        username: prev_username
                    },
                    data: updateData
                });
                return reply.send({
                    success: true,
                    user: {
                        username: updatedAccount.username,
                        email: updatedAccount.email,
                        password: updatedAccount.password
                    }
                });
            }
            catch (error) {
                return reply.status(500).send({ success: false, error: 'Account deletion failed' });
            }
        }));
    });
}
