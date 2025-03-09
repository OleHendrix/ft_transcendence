"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
console.log('Fakka');
const db = new sqlite3_1.default.Database("./accounts.db", (err) => {
    if (err)
        console.error("Error opening database:", err.message);
    else
        console.log("Connected to SQLite database.");
});
db.run(`CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
	password TEXT NOT NULL)`);
exports.default = db;
