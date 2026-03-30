import styles from './draggableItem.module.css';

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

export default function DraggableItem({ type, onDragStart }) {
    return (
        <div className={styles.draggableItem}>
            <img src={WIDGET_PREVIEWS[type]} alt={`${type} preview`} className={styles.preview}/>
        </div>
    )
}