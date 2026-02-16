import styles from "./WidgetBoard.module.css" 
import Widget from "../../components/Widgets/Widget"

export default function WidgetBoard({widgets}) {
    return (
        <div className = {styles.widgetBoard}>
            {widgets.map(widgetModel => (
                <Widget 
                    key = {widgetModel.id}
                    widgetModel = {widgetModel}
                />
            ))}
        </div>
    )
}   