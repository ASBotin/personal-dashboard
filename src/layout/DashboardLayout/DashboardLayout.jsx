import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import BurgerButton from "../../components/Burger/BurgerButton";
import styles from "./DashboardLayout.module.css"; 
import WidgetBoard from "../WidgetBoard/WidgetBoard";
import {useState, useContext} from 'react';
import { BoardsContext } from "../../BoardsContext"

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const {boards, activeBoardId} = useContext(BoardsContext);
    
    const activeBoard = boards.find(board => board.id === activeBoardId) 

    function toggleSidebar() {
        setIsSidebarOpen(prev => !prev);
    }

    return (    
        <div className = {styles.dashboardLayout}>
            <Sidebar 
                isOpen = {isSidebarOpen}
            />
            <BurgerButton 
                onClick = {toggleSidebar}
                isOpen = {isSidebarOpen}
            />
            <div className={styles.mainContent}>
                <Header />
                <WidgetBoard 
                    widgets = {activeBoard?.widgets || []}
                />
            </div>
        </div>
    )    
}