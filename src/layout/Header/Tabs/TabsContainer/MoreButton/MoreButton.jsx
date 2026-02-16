import styles from './MoreButton.module.css';
import { useState, useRef, useEffect, useContext } from 'react';
import { BoardsContext } from '../../../../../BoardsContext';

export default function MoreButton({hiddenTabs}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const {setActiveBoardId, removeBoard, renameBoard} = useContext(BoardsContext);
    const [editingId, setEditingId] = useState(null);
    const [tempName, setTempName] = useState("");
    const clickTimeout = useRef(null);

    const handleSave = (id) => {
        if (tempName.trim() !== "") {
            renameBoard(id, tempName.trim());
        }
        setEditingId(null);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !(menuRef.current.contains(event.target))) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, []);

    return (
        <div ref={menuRef} style={{position: 'relative'}}>
            <button 
                className={`${styles.moreButton} ${isMenuOpen ? styles.open : ''}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 12 12" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path 
                        d="M2 4L6 8L10 4" 
                        stroke="currentColor" 
                        strokeWidth="1.8" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            {isMenuOpen && (
                hiddenTabs && (
                    <ul className = {styles.dropdownMenu}>
                        {hiddenTabs.map((tab, index) => (
                            <li 
                                key={index}
                                className={`${styles.hiddenTab} ${editingId === tab.id ? styles.editing : ''}`}
                                onClick={() => {
                                    if (editingId === tab.id) return;
                                    clearTimeout(clickTimeout.current);
                                    clickTimeout.current = setTimeout(() => {
                                        setActiveBoardId(tab.id);
                                        setIsMenuOpen(false);
                                    }, 200);
                                }}
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    clearTimeout(clickTimeout.current);
                                    setEditingId(tab.id);
                                    setTempName(tab.name);
                                }}
                                role="button"
                                tabIndex={0}
                            >
                                {editingId === tab.id && (
                                    <input
                                        className={styles.renameInput}
                                        value={tempName}
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => setTempName(e.target.value)}
                                        onBlur={() => handleSave(tab.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSave(tab.id);
                                            if (e.key === 'Escape') setEditingId(null);
                                        }}
                                    />
                                )}
                                {editingId !== tab.id && (
                                    <>
                                        <span className={styles.tabName}>{tab.name}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeBoard(tab.id);
                                            }}
                                            className={styles.crossButton}
                                        >
                                            ×
                                        </button>
                                    </>
                                )}

                            </li>
                        ))}
                    </ul>
                )
            )}
        </div>
    )
}