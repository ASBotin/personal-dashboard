import Sidebar from "./Sidebar/Sidebar";
import Header from "./Header/Header";
import BurgerButton from "../components/Burger/BurgerButton";
import WidgetBoard from "./WidgetBoard/WidgetBoard";
import SignOutBtn from "../components/SignOutBtn/SignOutBtn";
import {useContext} from 'react';
import { BoardsContext } from "../BoardsContext";

export default function DashboardLayout() {
    
    const {boards, activeBoardId, isSidebarOpen, toggleSidebar} = useContext(BoardsContext);
    
    const activeBoard = boards.find(board => board.id === activeBoardId);
    

    return (    
        <div>
            <Sidebar 
                isOpen = {isSidebarOpen}
            />
            <BurgerButton 
                onClick = {toggleSidebar}
                isOpen = {isSidebarOpen}
            />
            <SignOutBtn
                onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/auth'; 
            }}
            />
            <div>
                <Header />
                <WidgetBoard 
                    widgets = {activeBoard?.widgets || []}
                />
            </div>
        </div>
    )    
}