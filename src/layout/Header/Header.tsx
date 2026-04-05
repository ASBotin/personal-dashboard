import styles from "./Header.module.css";
import TabsContainer from "./Tabs/TabsContainer/TabsContainer"

export default function Header() {
    return (
        <header className = {styles.header}>
            <TabsContainer/>
        </header>
    )
}