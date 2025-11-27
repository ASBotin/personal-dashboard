import styles from "./WidgetBoard.module.css" 
import Widget from "../../components/Widget/Widget"

export default function WidgetBoard({widgets, removeWidget, updateWidget}) {
    return (
        <div className = {styles.widgetBoard}>
            {widgets.map(widgetModel => (
                <Widget 
                    key = {widgetModel.id}
                    widgetModel = {widgetModel}
                    removeWidget = {removeWidget}
                    updateWidget = {updateWidget}
                />
            ))}
        </div>
    )
}