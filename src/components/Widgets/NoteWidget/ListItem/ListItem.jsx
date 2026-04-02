import styles from "./ListItem.module.css";
import { useRef, useState, useEffect} from "react";
import Grabber from '../../../../assets/controls/grabber.svg?react'
import { Reorder, useDragControls } from "framer-motion";


export default function ListItem({id, item, handleUpdateItem, handleDeleteItem, handleAddListItem, focusedItemId}) {
    const textRef = useRef(null);
    
    const [textareaText, setTextareaText] = useState(item.text || "");

    useEffect(() => {
        setTextareaText(item.text);
    }, [item.text]);

    useEffect(() => {
        if (focusedItemId === id && textRef.current) {
            textRef.current.focus();
        }
    }, [focusedItemId, id]);

    useEffect(() => {
        if (focusedItemId === id && textRef.current) {
            textRef.current.focus();
            // Добавляем скролл к элементу
            textRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }
    }, [focusedItemId, id]);

    function autoResize(ref) {
        const el = ref.current;
        if (!el) return;

        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    }
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && item.isCompleted) {
            if (!e.shiftKey) {
                e.preventDefault();
                e.target.blur();
            }
        }
        else if (e.key === 'Enter' && !item.isCompleted) {
            e.preventDefault();
            handleAddListItem(id);
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

    const controls = useDragControls();

    return (
        <Reorder.Item
            key={id}
            value={item}
            layout
            dragListener={false}
            dragControls={controls}
            className={styles.listItem}
            style={{
                display: "flex",
                flexDirection: "row",
                gap: "4px",
                width: "100%",
                alignItems: "center",
            }}
        >
            {!item.isCompleted && (
                <Grabber
                    className={styles.grabber}
                    onPointerDown={(e) => controls.start(e)}
                />
            )}
            <label className={styles.checkboxContainer}>
                <input 
                    type = "checkbox"
                    checked = {item.isCompleted}
                    className = {styles.realCheckbox}
                    onChange = {() => {
                        handleUpdateItem(id, textareaText, !item.isCompleted);
                    }}
                />
                <span className={styles.customCheckbox}></span>  
            </label>
            <textarea 
                ref = {textRef}
                rows = {1}
                className = {`${styles.text} ${item.isCompleted ? styles.completed : ''}`}
                value = {textareaText}
                onChange = {(e) => {
                    setTextareaText(e.target.value);
                    autoResize(textRef);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown = {handleKeyDown}
                onBlur = {() => handleUpdateItem(id, textareaText, item.isCompleted)}
            >
            </textarea>
            <button 
                className = {styles.deleteItem}
                onClick = {() => handleDeleteItem(id)}
            >
                ×        
            </button>
        </Reorder.Item>
    )
}