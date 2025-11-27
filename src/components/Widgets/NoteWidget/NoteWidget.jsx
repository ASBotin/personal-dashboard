import styles from "./NoteWidget.module.css"
import {useState, useRef, useEffect} from "react";
import CrossButton from "../../CrossButton/crossButton";

export default function NoteWidget({widgetModel, removeWidget, updateWidget}) {
    const [title, setTitle] = useState(widgetModel.data.title || "");
    const [text, setText] = useState(widgetModel.data.text || "");

    const titleRef = useRef(null);
    const textRef = useRef(null);

    function saveChanges() {
        updateWidget({
            ...widgetModel,
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
            <CrossButton 
                onClick = {() => removeWidget(widgetModel.id)}
            />

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
