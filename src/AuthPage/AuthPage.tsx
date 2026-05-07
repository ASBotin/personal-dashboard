import { useState } from 'react';
import styles from './AuthPage.module.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function AuthPage({ onLogin }: { onLogin: () => void }) {
    const [isRegistering, setIsRegistering] = useState<boolean>(false);
    const [emailInput, setEmailInput] = useState<string>("");
    const [passwordInput, setPasswordInput] = useState<string>("");
    const [confirmInput, setConfirmInput] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false); // Чекбокс
    const [error, setError] = useState<string | null>(null);

    // Маппинг ошибок с бэкенда
    const translateError = (err: string) => {
        if (err.includes("Email already exists")) return "Этот email уже занят";
        if (err.includes("Invalid credentials")) return "Неверный email или пароль";
        if (err.includes("Server error")) return "Ошибка сервера. Попробуйте позже";
        return "Произошла непредвиденная ошибка";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const endpoint = isRegistering ? '/auth/register' : '/auth/login';
        
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput, password: passwordInput })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(translateError(data.error));
            }

            if (isRegistering) {
                setIsRegistering(false);
                setEmailInput("");
                setPasswordInput("");
                setConfirmInput("");
                alert("Регистрация успешна! Теперь войдите.");
            } else {
                localStorage.setItem('token', data.token);
                onLogin();
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.formContainer}>
                <h2 className={styles.title}>{isRegistering ? 'Регистрация' : 'Вход в аккаунт'}</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.wrapper}>
                        <input 
                            type="email" 
                            placeholder="Email" 
                            required
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)} 
                            className={`${styles.formInput} ${styles.email}`}
                        />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Пароль" 
                            required 
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)} 
                            className={styles.formInput}
                        />
                        {isRegistering && 
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Подтвердите пароль" 
                                required
                                value={confirmInput}
                                onChange={(e) => setConfirmInput(e.target.value)}
                                className={styles.formInput} 
                            />
                        }
                        
                        <label className={styles.checkboxContainer}>
                            <input 
                                type="checkbox" 
                                checked={showPassword} 
                                onChange={() => setShowPassword(!showPassword)} 
                            />
                            <span>Показать пароль</span>
                        </label>
                    </div>

                    <div className={styles.wrapper}>
                        {error && <div className={styles.errorMessage}>{error}</div>}
                        
                        <button 
                            type="submit"
                            className={styles.submitBtn}
                            disabled={!emailInput.trim() || !passwordInput.trim() || (isRegistering && (!confirmInput.trim() || confirmInput !== passwordInput))}
                        >
                            {isRegistering ? 'Зарегистрироваться' : 'Войти'}
                        </button>

                        <p className={styles.toggleText}>
                            {isRegistering ? 'Есть аккаунт?' : "Нет аккаунта?"}{' '}
                            <button 
                                type="button" 
                                className={styles.toggle} 
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    setError(null);
                                }}
                            >
                                {isRegistering ? 'Войти' : 'Зарегистрироваться'}
                            </button>
                        </p>
                    </div>    
                </form>
            </div>
        </div>
    )
}