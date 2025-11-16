import NoteWidget from "../Widgets/NoteWidget/NoteWidget";    

export default function Widget({widget}) {
    switch (widget.type) {
        case "note":
            return <NoteWidget model={widget} />;
        default:
            return <div>Unknown widget type: {widget.type}</div>;
    }
}