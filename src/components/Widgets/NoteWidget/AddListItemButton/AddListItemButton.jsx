import styles from "./AddListItemButton.module.css";

export default function AddListItem({onAdd, className}) {
    return (
        <button 
            className={`${styles.addButton} ${className}`}
            onClick={onAdd}
        >
            +
        </button>
    )
}