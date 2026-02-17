import NoteWidget from "./NoteWidget/NoteWidget";    
import WeatherWidget from "./WeatherWidget/WeatherWidget";
import Pomodoro from "./Pomodoro/Pomodoro"

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
        case "pomodoro":
            return <Pomodoro
                widgetModel={widgetModel}
            />
        default:
            return <div>Unknown widget type: {widgetModel.type}</div>;
    }
}