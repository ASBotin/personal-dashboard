import styles from './WeatherWidget.module.css'
import CrossButton from '../../CrossButton/crossButton';

export default function WeatherWidget({widgetModel, removeWidget, updateWidget}) {
    return (
        <div className={styles.weatherWidget}>
            <CrossButton 
                onClick = {() => removeWidget(widgetModel.id)}
            />
        </div>
    )
}