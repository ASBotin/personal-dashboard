import styles from "./WidgetBoard.module.css" 
import Widget from "../../components/Widget/Widget"

export default function WidgetBoard({widgets}) {
    return (
        <div className = {styles.widgetBoard}>
            {widgets.map(widget => (
                <Widget 
                    key = {widget.id}
                    widget = {widget} 
                />
            ))}
        </div>
    )
}