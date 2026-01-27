import styles from './ButtonPane.module.css';

export default function CrossButton({ onClick }) {
    return (
        <button 
            className={styles.crossButton}
            onClick={onClick}
        >
            ×
        </button>
    )
}