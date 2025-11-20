import NoteWidget from "../Widgets/NoteWidget/NoteWidget";    

export default function Widget({widget, removeWidget, updateWidget}) {
    switch (widget.type) {
        case "note":
            return <NoteWidget
                model={widget} 
                removeWidget={removeWidget}
                updateWidget={updateWidget}
            />;
        default:
            return <div>Unknown widget type: {widget.type}</div>;
    }
}