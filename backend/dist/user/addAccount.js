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
exports.default = addAccount;
const bcrypt_1 = __importDefault(require("bcrypt"));
function addAccount(fastify, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/add-account', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            console.log("mebalzak");
            const { username, email, password } = request.body;
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            console.log("adding account: ", username);
            const existingAccount = yield prisma.account.findFirst({
                where: {
                    OR: [{ username: username }, { email: email }]
                }
            });
            if (existingAccount) {
                if (existingAccount.username === username)
                    return reply.status(400).send({ error: 'Username already exists' });
                if (existingAccount.email === email)
                    return reply.status(400).send({ error: 'Email already exists' });
            }
            const newAccount = yield prisma.account.create({
                data: {
                    username: username,
                    email: email,
                    password: hashedPassword
                }
            });
            return reply.send({ success: true, account: newAccount });
        }));
    });
}
