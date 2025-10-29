import Sidebar from "../Sidebar/Sidebar"
import Header from "../Header/Header"
import styles from "./DashboardLayout.module.css"   


export default function DashboardLayout({children}) {
    return (    
        <div className = {styles.dashboardLayout}>
            <Sidebar />
            <div className={styles.mainContent}>
                <Header />
                <div className ={styles.contentArea}>
                    {children}
                </div>
            </div>
        </div>
    )    
}