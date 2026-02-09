import styles from "./TabsContainer.module.css";
import { BoardsContext } from "../../../../BoardsContext";
import Tab from "../Tab/Tab";
import { useContext } from "react";

export default function TabsContainer() {
    const {boards, activeBoardId} = useContext(BoardsContext);

    return (
        <div className = {styles.tabs}>
            {boards.map(board => (
                <Tab
                    key = {board.id}
                    id = {board.id}
                    name = {board.name}
                    isActive = {board.id === activeBoardId}
                />
        ))}
        </div>
    )
}