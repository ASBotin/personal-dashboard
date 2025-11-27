import styles from "./Sidebar.module.css"

export default function Sidebar({isOpen, addWidget}) {
    return (
        <aside className = {`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            <h2 className={styles.title}>Виджеты</h2>
            <button className={styles.button} onClick = {() => addWidget("note")}>Заметка</button>
            <button className={styles.button} onClick = {() => addWidget("weather")}>Погода</button>
        </aside> 
    )
}