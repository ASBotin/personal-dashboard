import styles from "./NoteWidget.module.css"

export default function NoteWidget({model}) {
    return (
        <div className={styles.note}>
            <h3 className={styles.title}>Note Widget</h3>
            <p className={styles.title}>{model.data.text || "This is a note widget."}</p>
        </div>
    );
}