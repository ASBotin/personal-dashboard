import DashBoardLayout from "./layout/DashboardLayout";
import AuthPage from "./AuthPage/AuthPage";
import {BoardsProvider} from "./BoardsProvider";

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from "react";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
        <Routes>
          <Route 
            path="/auth" 
            element={ isAuthenticated ? <Navigate to="/"/> : <AuthPage onLogin={() => setIsAuthenticated(true)}/> }
          />
          <Route
            path="/"
            element={ isAuthenticated ? <BoardsProvider><DashBoardLayout /></BoardsProvider> : <Navigate to="/auth"/> }
          />   
        </Routes>
    </BrowserRouter>
  )
}

