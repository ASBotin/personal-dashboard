import NoteWidget from "../Widgets/NoteWidget/NoteWidget";    
import WeatherWidget from "../Widgets/weatherWidget/weatherWidget";

export default function Widget({widgetModel, removeWidget, updateWidget}) {
    switch (widgetModel.type) {
        case "note":
            return <NoteWidget
                widgetModel={widgetModel} 
                removeWidget={removeWidget}
                updateWidget={updateWidget}
            />;
        case "weather":
            return <WeatherWidget
                widgetModel={widgetModel}
                removeWidget={removeWidget}
                updateWidget={updateWidget}
            />;
        default:
            return <div>Unknown widget type: {widgetModel.type}</div>;
    }
}