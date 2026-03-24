import styles from "./ListItem.module.css";
import { useRef, useState, useEffect} from "react";

export default function ListItem({id, text, isCompleted, handleUpdateItem, handleDeleteItem}) {
    const textRef = useRef(null);
    const [completed, setCompleted] = useState(isCompleted || false);
    const [textareaText, setTextareaText] = useState(text || "");

    function autoResize(ref) {
        const el = ref.current;
        if (!el) return;

        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    }
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (!e.shiftKey) {
                e.preventDefault();
                e.target.blur();
            }
        }
    }

    useEffect(() => {
        autoResize(textRef);
    }, [textareaText]);

    useEffect(()=>{
        const el = textRef.current;
        if (!el) return;

        const observer = new ResizeObserver(() => {
            autoResize(textRef)
        })

        observer.observe(el);

        return () => observer.disconnect;
    }, []);

    return (
        <div className={styles.listItem}>
            <label className={styles.checkboxContainer}>
                <input 
                    type = "checkbox"
                    checked = {completed}
                    className = {styles.realCheckbox}
                    onChange = {() => {
                        setCompleted(!completed);
                        handleUpdateItem(id, textareaText, !completed);
                    }}
                />
                <span className={styles.customCheckbox}></span>  
            </label>
            <textarea 
                ref = {textRef}
                rows = {1}
                className = {`${styles.text} ${completed ? styles.completed : ''}`}
                value = {textareaText}
                onChange = {(e) => {
                    setTextareaText(e.target.value);
                    autoResize(textRef);
                }}
                onKeyDown = {handleKeyDown}
                onBlur = {() => handleUpdateItem(id, textareaText, completed)}
            >
            </textarea>
            <button 
                className = {styles.deleteItem}
                onClick = {() => handleDeleteItem(id)}
            >
                ×        
            </button>
        </div>
    )
}