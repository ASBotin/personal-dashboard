import styles from './CrossButton.module.css';

export default function CrossButton({ onClick, color }) {
    return (
        <button 
            className={styles.crossButton}
            onClick={onClick}
            style={{ color }}   
        >
            ×
        </button>
    )
}