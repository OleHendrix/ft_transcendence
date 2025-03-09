"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 5001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const db = new sqlite3_1.default.Database("./database.db", (err) => {
    if (err)
        console.error("Error opening database:", err.message);
    else
        console.log("Connected to SQLite database.");
});
db.run(`CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
	password TEXT NOT NULL,
	wins INTEGER,
	draws INTEGER,
	loses INTEGER)`);
app.get('/', (req, res) => {
    res.send('Server is runnineff hjegiufrfrfggrgrrgfe efefg!');
});
app.post('/api/addaccount', (req, res) => {
    const { username, email, password } = req.body;
    db.get('SELECT username, email FROM accounts WHERE username = ? OR email = ?', [username, email], (err, row) => {
        if (err)
            return (res.status(500).json({ error: "Error fetching database data" }));
        if (row) {
            if (row.username === username)
                return (res.status(400).json({ error: "Username already exists" }));
            else if (row.email === email)
                return (res.status(400).json({ error: "Email already exists" }));
        }
        else {
            db.run('INSERT INTO accounts (username, email, password, wins, draws, loses) VALUES (?, ?, ?, 0, 0, 0)', [username, email, password], (err) => {
                if (err) {
                    console.log(err.message);
                    return (res.status(500).json({ error: "Could not add account to database" }));
                }
                ;
                return (res.json({ success: true }));
            });
        }
    });
});
app.get('/api/getplayers', (req, res) => {
    db.all('SELECT * FROM accounts', (err, rows) => {
        if (err)
            return (res.status(500).json({ error: "Error getting players from database" }));
        return (res.json({ success: true, players: rows }));
    });
});
app.listen(PORT, () => { console.log(`Server running at http://localhost:${PORT}`); });
