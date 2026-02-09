import styles from "./Tab.module.css";
import { BoardsContext } from "../../../../BoardsContext";

export default function Tab({id, name, isActive}) {
    return (
        <div className={`${styles.tab} ${isActive ? styles.active : ''}`}>
            {name}
        </div>
    )
}