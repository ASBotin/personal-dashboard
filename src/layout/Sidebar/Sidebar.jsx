import styles from "./Sidebar.module.css"

export default function Sidebar({isOpen, children}) {
    return (
        <aside className = {`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            <h2 className={styles.title}>Виджеты</h2>
            { children }
        </aside> 
    )
}