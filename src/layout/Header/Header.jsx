import styles from "./Header.module.css"

export default function Header({ children }) {
    return (
        <header className = {styles.header}>
            Тут будет шапка
            { children }
        </header>
    )
}