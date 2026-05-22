import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import boardRoutes from './routes/boards.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);

// Подключение к БД
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/dashboard_db';

mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('DB Error:', err));

app.get('/', (req, res) => {
    res.send('API is running in ESM mode...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});