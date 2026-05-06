import { useState } from 'react';
import styles from './AuthPage.module.css';

export default function AuthPage({ onLogin }: { onLogin: () => void }) {
    const [isRegistering, setIsRegistering] = useState<boolean>(false);
    const [emailInput, setEmailInput] = useState<string>("");
    const [passwordInput, setPasswordInput] = useState<string>("");
    const [confirmInput, setConfirmInput] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    }

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
                            type="password" 
                            placeholder="Пароль" 
                            required 
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)} 
                            className={styles.formInput}
                        />
                        {isRegistering && 
                            <input 
                                type="password" 
                                placeholder="Подтвердите пароль" 
                                required
                                value={confirmInput}
                                onChange={(e) => setConfirmInput(e.target.value)}
                                className={styles.formInput} 
                            />
                        }
                    </div>
                    <div className={styles.wrapper}>
                        <button 
                            type="submit"
                            className={styles.submitBtn}
                            disabled={!emailInput.trim() || !passwordInput.trim() || (isRegistering && !confirmInput.trim())}
                        >
                            {isRegistering ? 'Зарегистрироваться' : 'Войти'}
                        </button>
                        <p className={styles.toggleText}>
                            {isRegistering ? 'Есть аккаунт?' : "Нет аккаунта?"}{' '}
                            <button 
                                type="button" 
                                className={styles.toggle} 
                                onClick={() => setIsRegistering(!isRegistering)}
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