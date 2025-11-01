import Sidebar from "../Sidebar/Sidebar"
import Header from "../Header/Header"
import BurgerButton from "../../components/Burger/BurgerButton"
import styles from "./DashboardLayout.module.css"   
import {useState} from 'react';

export default function DashboardLayout({children}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    function toggleSidebar() {
        setIsSidebarOpen(prev => !prev);
    }

    return (    
        <div className = {styles.dashboardLayout}>
            <Sidebar isOpen = {isSidebarOpen}/>
            <BurgerButton 
                onClick = {toggleSidebar}
                isOpen = {isSidebarOpen}
            />
            <div className={styles.mainContent}>
                <Header 
                    onToggleSidebar = {toggleSidebar}
                    isOpen = {isSidebarOpen}
                />
                <div className ={styles.contentArea}>
                    {children}
                </div>
            </div>
        </div>
    )    
}