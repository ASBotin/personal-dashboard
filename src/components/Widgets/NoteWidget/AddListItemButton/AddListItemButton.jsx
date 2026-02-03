import styles from "./AddListItemButton.module.css";

export default function AddListItem({onAdd}) {
    return (
        <button 
            className={styles.addButton}
            onClick={onAdd}
        >
            +
        </button>
    )
}