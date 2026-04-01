import styles from './draggableItem.module.css';

import { useState, useRef, useContext, useEffect } from 'react';
import { BoardsContext } from '../../../BoardsContext';

import gitActivityTrackerPreview from '../../../assets/widgetPreviews/activityTracker.png';
import pomodoroPreview from '../../../assets/widgetPreviews/pomodoro.png';
import repositoryTrackerPreview from '../../../assets/widgetPreviews/repositoryTracker.png';
import weatherPreview from '../../../assets/widgetPreviews/weather.png';
import notePreview from '../../../assets/widgetPreviews/note.png';

const WIDGET_PREVIEWS = {
    gitActivityTracker: gitActivityTrackerPreview,
    pomodoro: pomodoroPreview,
    repositoryTracker: repositoryTrackerPreview,
    weather: weatherPreview,
    note: notePreview
};

export default function DraggableItem({ type }) {

    const [isReadyToDrag, setIsReadyToDrag] = useState(false);
    const [animating, setAnimating] = useState(false);
    const timerRef = useRef(null);
    const {toggleSidebar, setDraggedType, isSidebarOpen} = useContext(BoardsContext);

    useEffect(() => {
        if (!isSidebarOpen) {
            setAnimating(false);
            setIsReadyToDrag(false);
        }
    }, [isSidebarOpen])

    const handleMouseDown = () => {
        setAnimating(true);
        timerRef.current = setTimeout(() => {
            setIsReadyToDrag(true);
            setAnimating(false);
        }, 350)
    }
    const handleMouseUp = () => {
        clearTimeout(timerRef.current);
        setAnimating(false);
        setIsReadyToDrag(false);
    }
    const handleMouseMove = () => {
        if (!isReadyToDrag) {
            clearTimeout(timerRef.current);
            setAnimating(false);
            setIsReadyToDrag(false);
        }
    }
    const handleDragStart = (e) => {
        toggleSidebar();
        setAnimating(false);
        setIsReadyToDrag(false);
        setDraggedType(type);
        e.dataTransfer.setData("text/plain", type);
    }


    return (
        <div 
            className={`${styles.draggableItem} ${animating ? styles.scaling : ""} ${isReadyToDrag ? styles.ready : ""}`}
            draggable={isReadyToDrag}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onDragStart={handleDragStart}
        >
            <img src={WIDGET_PREVIEWS[type]} alt={`${type} preview`} draggable={isReadyToDrag} className={styles.preview}/>
        </div>
    )
}