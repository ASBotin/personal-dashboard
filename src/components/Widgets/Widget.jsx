import NoteWidget from "./NoteWidget/NoteWidget";    
import WeatherWidget from "./WeatherWidget/WeatherWidget";

export default function Widget({widgetModel}) {
    switch (widgetModel.type) {
        case "note":
            return <NoteWidget
                widgetModel={widgetModel} 
            />;
        case "weather":
            return <WeatherWidget
                widgetModel={widgetModel}
            />;
        default:
            return <div>Unknown widget type: {widgetModel.type}</div>;
    }
}