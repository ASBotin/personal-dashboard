import styles from './BurgerButton.module.css';

interface BurgerButtonProps {
    onClick: () => void;
    isOpen: boolean;
}

export default function BurgerButton({onClick, isOpen}: BurgerButtonProps) {
    return (
        <button 
            className = {`${styles.burger} ${isOpen ? styles.open : ''}`}
            onClick = {onClick}
            aria-label = "Toggle sidebar"
        >
            <span />
            <span />
            <span />
        </button>
    )
}