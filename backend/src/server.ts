import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) =>
{
	res.send('Server is runnineff hjegiufe efefg!');
});

app.listen(PORT, () => {console.log(`Server running at http://localhost:${PORT}`);});