import DashBoardLayout from "./layout/DashboardLayout";
import AuthPage from "./AuthPage/AuthPage";
import {BoardsProvider} from "./BoardsProvider";

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from "react";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isAuthenticating, setIsAuthenticating] = useState(
    import.meta.env.PROD && !localStorage.getItem('token')
  );
  const [autoLoginError, setAutoLoginError] = useState<string | null>(null);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD || localStorage.getItem('token')) return;

    let isActive = true;

    const loginToDemoAccount = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@test.com', password: '123' })
        });

        if (!response.ok) {
          throw new Error('Автоматический вход в демо-аккаунт не выполнен');
        }

        const data: { token?: string } = await response.json();
        if (!data.token) {
          throw new Error('Сервер не вернул токен авторизации');
        }

        localStorage.setItem('token', data.token);
        if (isActive) setIsAuthenticated(true);
      } catch (error) {
        console.error('Demo account login failed:', error);
        if (isActive) setAutoLoginError('Не удалось войти в демо-аккаунт. Войдите вручную.');
      } finally {
        if (isActive) setIsAuthenticating(false);
      }
    };

    loginToDemoAccount();

    return () => {
      isActive = false;
    };
  }, []);

  if (isAuthenticating) {
    return (
      <div
        role="status"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#e3eaf5'
        }}
      >
        Выполняется вход в демо-аккаунт…
      </div>
    );
  }

  return (
    <BrowserRouter>
        <Routes>
          <Route 
            path="/auth" 
            element={
              isAuthenticated
                ? <Navigate to="/"/>
                : <AuthPage
                    onLogin={() => setIsAuthenticated(true)}
                    initialError={autoLoginError}
                  />
            }
          />
          <Route
            path="/"
            element={ isAuthenticated ? <BoardsProvider><DashBoardLayout /></BoardsProvider> : <Navigate to="/auth"/> }
          />   
        </Routes>
    </BrowserRouter>
  )
}
