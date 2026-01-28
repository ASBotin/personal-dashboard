import styles from './CrossButton.module.css';

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