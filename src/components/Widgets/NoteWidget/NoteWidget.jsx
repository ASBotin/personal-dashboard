import styles from "./NoteWidget.module.css"
import {useState, useRef, useEffect} from "react";

export default function NoteWidget({model, removeWidget, updateWidget}) {
    const [title, setTitle] = useState(model.data.title || "");
    const [text, setText] = useState(model.data.text || "");

    const titleRef = useRef(null);
    const textRef = useRef(null);

    function saveChanges() {
        updateWidget({
            ...model,
            data: { title, text }
        });
    }

    function autoResize(ref) {
        const el = ref.current;
        if (!el) return;

        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    }

    useEffect(() => {
        autoResize(titleRef);
        autoResize(textRef);
    }, []);

    return (
        <div className={styles.note}>
            <button 
                className={styles.deleteButton}
                onClick={() => removeWidget(model.id)}
            >×</button>

            <textarea
                ref={titleRef}
                rows={1}
                className={styles.title}
                value={title}
                placeholder="Заметка"
                onChange={e => {
                    setTitle(e.target.value);
                    autoResize(titleRef);
                }}
                onBlur={saveChanges}
            />

            <textarea
                ref={textRef}
                className={styles.text}
                value={text}
                placeholder="Введите текст заметки..."
                onChange={e => {
                    setText(e.target.value);
                    autoResize(textRef);
                }}
                onBlur={() => {
                    saveChanges();
                    autoResize(textRef);
                }}
            />
        </div>
    );
}
