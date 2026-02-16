import styles from "./Tab.module.css";
import { BoardsContext } from "../../../../BoardsContext";
import {useContext, useEffect, useState} from "react"

export default function Tab({id, name, isActive, onEditingStart, onEditingEnd}) {
    const {setActiveBoardId, removeBoard, renameBoard} = useContext(BoardsContext);
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(name);

    useEffect(() => {
        setTempName(name);
    }, [name]);

    const handleStartEditing = () => {
        setIsEditing(true);
        onEditingStart();
    };

    const handleSave = () => {
        setIsEditing(false);
        onEditingEnd();
        if (tempName.trim() !== "" && tempName !== name) {
            renameBoard(id, tempName.trim());
        } else {
            setTempName(name);
        }
    };

    return (
        <div 
            className={`${styles.tab} ${isActive ? styles.active : ''} ${isEditing ? styles.editing : ''}`}
            onClick={() => !isEditing && setActiveBoardId(id)}
            onDoubleClick={handleStartEditing}
            role="button"
            tabIndex={0}
        >
            {isEditing ? (
                <input
                    className={styles.renameInput}
                    value={tempName}
                    autoFocus
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') { setIsEditing(false); setTempName(name); }
                    }}
                />
            ) : (
                <>
                    <span className={styles.tabName}>{name}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            removeBoard(id);
                        }}
                        className={`${styles.crossButton} ${isActive ? styles.active : ''}`}
                    >
                        ×
                    </button>
                </>
            )}
        </div>
    );
}