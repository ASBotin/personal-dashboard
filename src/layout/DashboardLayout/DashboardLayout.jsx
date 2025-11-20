import Sidebar from "../Sidebar/Sidebar"
import Header from "../Header/Header"
import BurgerButton from "../../components/Burger/BurgerButton"
import styles from "./DashboardLayout.module.css" 
import WidgetBoard from "../WidgetBoard/WidgetBoard"
import {useState} from 'react';
import {createBoard} from "../../models/board";
import {createWidget} from "../../models/widget";

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [board, setBoard] = useState(createBoard());

    function toggleSidebar() {
        setIsSidebarOpen(prev => !prev);
    }

    function addWidget(type) {
        const newWidget = createWidget(type);
        setBoard(prev => ({
            ...prev,
            widgets: [...prev.widgets, newWidget]
        }))
    }

    function removeWidget(id) {
        setBoard(prev => ({
            ...prev,
            widgets: prev.widgets.filter(widget => widget.id !== id)
        }))
    }

    function updateWidget(updatedWidget) {
        setBoard(prev => ({
            ...prev,
            widgets: prev.widgets.map(widget =>
                widget.id === updatedWidget.id ? updatedWidget : widget
            )
        }))
    }

    return (    
        <div className = {styles.dashboardLayout}>
            <Sidebar 
                isOpen = {isSidebarOpen}
                addWidget = {addWidget}    
            />
            <BurgerButton 
                onClick = {toggleSidebar}
                isOpen = {isSidebarOpen}
            />
            <div className={styles.mainContent}>
                <Header />
                <WidgetBoard 
                    widgets = {board.widgets}
                    removeWidget = {removeWidget}
                    updateWidget = {updateWidget}
                />

            </div>
        </div>
    )    
}