import styles from './ActionButton.module.css';

export default function ActionButton({onClick}) {
    return (
        <button
            className = {styles.actionButton}
            onClick = {onClick}
        >
            ⋮
        </button>
    )
}