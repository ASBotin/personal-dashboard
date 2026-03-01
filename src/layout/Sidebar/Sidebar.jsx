import styles from "./Sidebar.module.css";
import { BoardsContext } from "../../BoardsContext";
import { useContext } from "react";

export default function Sidebar({isOpen}) {

    const {addWidget} = useContext(BoardsContext)

    return (
        <aside className = {`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            <h2 className={styles.title}>Виджеты</h2>
            <button className={styles.button} onClick = {() => addWidget("note")}>Заметка</button>
            <button className={styles.button} onClick = {() => addWidget("weather")}>Погода</button>
            <button className={styles.button} onClick = {() => addWidget("pomodoro")}>Pomodoro</button>
            <button className={styles.button} onClick = {() => addWidget("repositoryTracker")}>Трекер репозитория</button>
        </aside> 
    )
}