import styles from "./Sidebar.module.css";
import { BoardsContext } from "../../BoardsContext";
import { useContext } from "react";
import DraggableItem from "./DraggableItem/DraggableItem";

export default function Sidebar({isOpen} : {isOpen: boolean}) {
 
    const {addWidget} = useContext(BoardsContext)

    return (
        <aside className = {`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            <h2 className={styles.title}>Виджеты</h2>
            <div className={styles.widgetList}>
                <button className={styles.button} onClick = {() => addWidget("gitIssuesPR")}>Github Issues/PR</button>
                <div className={styles.preview}><DraggableItem type="gitIssuesPR"/></div>

                <button className={styles.button} onClick = {() => addWidget("gitActivityTracker")}>Календарь активности Github</button>
                <div className={styles.preview}><DraggableItem type="gitActivityTracker"/></div>

                <button className={styles.button} onClick = {() => addWidget("repositoryTracker")}>Трекер репозитория Github</button>
                <div className={styles.preview}><DraggableItem type="repositoryTracker"/></div>

                <button className={styles.button} onClick = {() => addWidget("note")}>Заметка/Список</button>
                <div className={styles.preview}><DraggableItem type="note"/></div>

                <button className={styles.button} onClick = {() => addWidget("pomodoro")}>Pomodoro</button>
                <div className={styles.preview}><DraggableItem type="pomodoro"/></div>

                <button className={styles.button} onClick = {() => addWidget("bookmarks")}>Закладки</button>
                <div className={styles.preview}><DraggableItem type="bookmarks"/></div>

                <button className={styles.button} onClick = {() => addWidget("weather")}>Погода</button>
                <div className={styles.preview}><DraggableItem type="weather"/></div>
            </div>
        </aside> 
    )
}