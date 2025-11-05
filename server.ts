import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db';
import authRoutes from './routes/auth';
import classRoutes from './routes/classes';
import studentRoutes from './routes/students';
import attendanceRoutes from './routes/attendance';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ message: 'Server is running!' });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../dist'));

  app.get('*', (req: Request, res: Response) => {
    res.sendFile('../dist/index.html');
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
