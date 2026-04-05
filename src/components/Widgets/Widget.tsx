import React from 'react';
import Note from "./Note/Note";    
import WeatherWidget from "./Weather/Weather";
import Pomodoro from "./Pomodoro/Pomodoro"
import RepositoryTracker from "./RepositoryTracker/RepositoryTracker";
import GitActivityTracker from "./GitActivityTracker/GitActivityTracker";
import { WidgetModel } from "../../models/widgetModel";

interface WidgetProps {
    readonly widgetModel: WidgetModel;
}

function Widget({widgetModel}: WidgetProps) {
    switch (widgetModel.type) {
        case "note":
            return <Note
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
        case "repositoryTracker":
            return <RepositoryTracker
                widgetModel={widgetModel}
            />
        case "gitActivityTracker":
            return <GitActivityTracker
                widgetModel={widgetModel}
            />
        default:
            console.warn(`Unknown widget type: ${widgetModel.type}`);
            return null;
    }
}

export default React.memo(Widget);