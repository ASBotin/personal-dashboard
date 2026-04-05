import styles from "./AddListItemButton.module.css";

export default function AddListItem({onAdd}: {readonly onAdd: () => void}) {
    return (
        <button 
            className={styles.addButton}
            onClick={onAdd}
        >
            +
        </button>
    )
}