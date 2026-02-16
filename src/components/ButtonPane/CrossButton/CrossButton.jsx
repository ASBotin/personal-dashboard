import styles from './CrossButton.module.css';

export default function CrossButton({ onClick, className }) {
    return (
        <button 
            className={`${styles.crossButton} ${styles[className] || ''}`}
            onClick={onClick}   
        >
            ×
        </button>
    )
}