import styles from "./Sidebar.module.css";
import { BoardsContext } from "../../BoardsContext";
import { useContext } from "react";
import DraggableItem from "./draggableItem/DraggableItem";

export default function Sidebar({isOpen}) {

    const {addWidget} = useContext(BoardsContext)

    return (
        <aside className = {`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            <h2 className={styles.title}>Виджеты</h2>
            <div className={styles.widgetList}>
                <button className={styles.button} onClick = {() => addWidget("note")}>Заметка</button>
                <div className={styles.preview}><DraggableItem type="note"/></div>

                <button className={styles.button} onClick = {() => addWidget("weather")}>Погода</button>
                <div className={styles.preview}><DraggableItem type="weather"/></div>

                <button className={styles.button} onClick = {() => addWidget("pomodoro")}>Pomodoro</button>
                <div className={styles.preview}><DraggableItem type="pomodoro"/></div>

                <button className={styles.button} onClick = {() => addWidget("repositoryTracker")}>Трекер репозитория</button>
                <div className={styles.preview}><DraggableItem type="repositoryTracker"/></div>
                   
                <button className={styles.button} onClick = {() => addWidget("gitActivityTracker")}>Календарь активности</button>
                <div className={styles.preview}><DraggableItem type="gitActivityTracker"/></div>
            </div>
        </aside> 
    )
}