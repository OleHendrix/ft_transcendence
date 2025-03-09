import sqlite3 from "sqlite3";
import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db", (err) =>
{
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

app.get('/', (req, res) =>
{
	res.send('Server is runnineff hjegiufrfrfggrgrrgfe efefg!');
});

app.post('/api/addaccount', (req: Request, res: Response) =>
{
	const { username, email, password } = req.body;
	db.get<{ username?: string; email?: string }>('SELECT username, email FROM accounts WHERE username = ? OR email = ?', [username, email], (err, row) =>
	{
		if (err)
			return (res.status(500).json({ error: "Error fetching database data" }));
		if (row)
		{
			if (row.username === username)
				return (res.status(400).json( { error: "Username already exists" }));
			else if (row.email === email)
				return (res.status(400).json({ error: "Email already exists" }));
		}
		else
		{
			db.run('INSERT INTO accounts (username, email, password, wins, draws, loses) VALUES (?, ?, ?, 0, 0, 0)', [username, email, password], (err) =>
			{
				if (err)
					{console.log(err.message);
					return (res.status(500).json({ error: "Could not add account to database" }))};
				return (res.json({ success: true }));
			})
		}
	})
});

app.get('/api/getplayers', (req: Request, res: Response) =>
{
	db.all('SELECT * FROM accounts', (err, rows) =>
	{
		if (err)
			return (res.status(500).json({ error: "Error getting players from database" }));
		return (res.json({ success: true, players: rows}));
	})
})

app.listen(PORT, () => {console.log(`Server running at http://localhost:${PORT}`);});