import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import repoRouter from './routes/repo.js';

dotenv.config();

const app = express();

app.use(cors({ origin: '*'}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', repoRouter);


const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`README Generator backend listening on port ${PORT}`);
});
