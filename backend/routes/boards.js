import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../User.js';

const router = express.Router();

// Middleware для защиты роутов
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_123');
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// Получить все доски текущего пользователя
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        res.json(user.boards);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch boards" });
    }
});

// Сохранить (перезаписать) массив досок
router.put('/', authMiddleware, async (req, res) => {
    try {
        // req.body здесь — это твой массив BoardModel[]
        await User.findByIdAndUpdate(req.userId, { boards: req.body });
        res.json({ message: "Boards saved successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to save boards" });
    }
});

export default router;