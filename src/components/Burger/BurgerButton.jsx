import styles from './BurgerButton.module.css';

export default function BurgerButton({onClick, isOpen}) {
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