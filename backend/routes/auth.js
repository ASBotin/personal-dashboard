import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../User.js';

const router = express.Router();

// Регистрация нового пользователя
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({ 
            email, 
            password: hashedPassword,
            boards: []
        });
        
        await user.save();
        res.status(201).json({ message: "User created" });
    } catch (err) {
        res.status(400).json({ error: "Email already exists or invalid data" });
    }
});

// Логин
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && await bcrypt.compare(password, user.password)) {
            // Создаем JWT токен на 7 дней
            const token = jwt.sign(
                { id: user._id }, 
                process.env.JWT_SECRET || 'super_secret_key_123', 
                { expiresIn: '7d' }
            );
            res.json({ token, email: user.email });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

export default router;