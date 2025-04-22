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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = upload;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const stream_1 = require("stream");
const util_1 = require("util");
const multipart_1 = __importDefault(require("@fastify/multipart"));
const static_1 = __importDefault(require("@fastify/static"));
const pump = (0, util_1.promisify)(stream_1.pipeline);
function upload(fastify, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.register(multipart_1.default);
        fastify.register(static_1.default, {
            root: path_1.default.join(process.cwd(), 'uploads'),
            prefix: '/uploads/',
        });
        fastify.post('/api/upload', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            const parts = request.parts();
            let username = '';
            let filepath = '';
            try {
                for (var _d = true, parts_1 = __asyncValues(parts), parts_1_1; parts_1_1 = yield parts_1.next(), _a = parts_1_1.done, !_a; _d = true) {
                    _c = parts_1_1.value;
                    _d = false;
                    const part = _c;
                    if (part.type === 'file' && part.fieldname === 'image') {
                        const filename = `${Date.now()}-${part.filename}`;
                        const uploadPath = path_1.default.join(process.cwd(), '/uploads');
                        if (!fs_1.default.existsSync(uploadPath))
                            fs_1.default.mkdirSync(uploadPath, { recursive: true });
                        filepath = path_1.default.join(uploadPath, filename);
                        yield pump(part.file, fs_1.default.createWriteStream(filepath));
                    }
                    else if (part.type === 'field' && part.fieldname === 'username')
                        username = part.value;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = parts_1.return)) yield _b.call(parts_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            const updatedAccount = yield prisma.account.update({
                where: {
                    username: username
                },
                data: {
                    avatar: `/uploads/${path_1.default.basename(filepath)}`
                }
            });
            reply.send({ success: true, imageUrl: `/uploads/${path_1.default.basename(filepath)}` });
        }));
    });
}
