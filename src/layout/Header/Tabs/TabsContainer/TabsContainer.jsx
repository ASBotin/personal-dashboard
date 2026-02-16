import styles from "./TabsContainer.module.css";
import { BoardsContext } from "../../../../BoardsContext";
import Tab from "../Tab/Tab";
import { useContext, useEffect, useRef, useState } from "react";
import MoreButton from "./MoreButton/MoreButton";

const MIN_TAB_WIDTH = 60;
const CONTROLS_WIDTH = 100;

export default function TabsContainer() {
    const {boards, activeBoardId, addBoard} = useContext(BoardsContext);
    const containerRef = useRef(null);

    const [containerWidth, setContainerWidth] = useState(0);
    const [editingId, setEditingId] = useState(null);

    let maxVisibleTabs;
    if (editingId) {
        const remainingWidth = containerWidth - CONTROLS_WIDTH - 200;
        const otherTabsCount = Math.floor(remainingWidth / MIN_TAB_WIDTH);
        maxVisibleTabs = 1 + Math.max(0, otherTabsCount); 
    } else {
        maxVisibleTabs = Math.floor((containerWidth - CONTROLS_WIDTH) / MIN_TAB_WIDTH);
    }

    useEffect(() => {
        if (!containerRef.current) return;
        
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const width = entry.contentRect.width;
                setContainerWidth(width);
            }
        })

        observer.observe(containerRef.current);

        return () => {
            observer.disconnect();
        }
    }, []);

    const activeIndex = boards.findIndex(b => b.id === activeBoardId);

    let visibleTabs = [];
    let hiddenTabs = [];

    if (boards.length <= maxVisibleTabs) {
        visibleTabs = boards;
        hiddenTabs = [];
    } else {
        if (activeIndex < maxVisibleTabs) {
            visibleTabs = boards.slice(0, maxVisibleTabs);
            hiddenTabs = boards.slice(maxVisibleTabs);
        } else {
            const firstPart = boards.slice(0, maxVisibleTabs - 1);
            const activeTab = boards[activeIndex];
            
            visibleTabs = [...firstPart, activeTab];
            
            hiddenTabs = boards.filter(b => !visibleTabs.find(v => v.id === b.id));
        }
    }

    return (
        <div ref={containerRef} className = {styles.container}>
            <div className={styles.tabs}>
                {visibleTabs.map(board => (
                    <Tab
                        key = {board.id}
                        id = {board.id}
                        name = {board.name}
                        isActive = {board.id === activeBoardId}
                        onEditingStart={() => setEditingId(board.id)}
                        onEditingEnd={() => setEditingId(null)}
                    />
                ))}
            </div>
            <div className={styles.controls}>
                <button className={styles.addButton} onClick={() => {addBoard()}}>+</button>
                {hiddenTabs.length > 0 && <MoreButton hiddenTabs={hiddenTabs}/>}
            </div>
        </div>
    )
}