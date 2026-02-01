import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/repo.js';
import { AuthRoutes } from './routes/authRoutes.js';


dotenv.config();

const app = express();

app.use(
  cors({
     origin: process.env.FRONTEND_URL,
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', AuthRoutes);
app.use('/services', router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({error : 'Not Found',
    message:`the Route${req.method} ${req.originalUrl} not found `});
  });

  //Global error handler 
  app.use((err, req, res, next)=>{
console.error("Global error handler:",{
  message: err.message,
  stack: err.stack,
  status: err.status || 500,
  });
});
  

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`README Generator backend listening on port ${PORT}`);
});
