import styles from './CrossButton.module.css';

interface CrossButtonProps {
    readonly onClick: () => void;
    readonly className?: string;
}

export default function CrossButton({ onClick, className }: CrossButtonProps) {
    return (
        <button 
            className={`${styles.crossButton} ${className ? styles[className] : ''}`}
            onClick={onClick}   
        >
            ×
        </button>
    )
}