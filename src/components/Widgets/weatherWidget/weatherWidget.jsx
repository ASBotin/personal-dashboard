import styles from './weatherWidget.module.css'

export default function WeatherWidget({widgetModel, removeWidget, updateWidget}) {
    return (
        <div className={styles.weatherWidget}>
            <button 
                className={styles.deleteButton}
                onClick={() => removeWidget(widgetModel.id)}
            >×</button>
        </div>
    )
}