import styles from "./NoteWidget.module.css"
import {useState} from "react";

export default function NoteWidget({model, removeWidget, updateWidget}) {
    const [title, setTitle] = useState(model.data.title || "");
    const [text, setText] = useState(model.data.text || "");

    function saveChanges() {
        updateWidget({
            ...model,
            data: {
                title,
                text
            }
        })
    }

    return (
        <div className={styles.note}>
            <button 
                className={styles.deleteButton}
                onClick={() => removeWidget(model.id)}
            >×</button>
            <input
                className={styles.title}
                value = {title}
                placeholder = "Заметка"
                onChange = {e => {setTitle(e.target.value)}}
                onBlur = {saveChanges}  
            />
            <textarea
                className={styles.text}
                value = {text}
                placeholder = "Введите текст заметки..."
                onChange = {e => setText(e.target.value)}
                onBlur = {saveChanges}
            />
        </div>
    );
}