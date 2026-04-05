import {WidgetModel} from "./widgetModel";

export interface BoardModel {
    id: string;
    name: string;
    widgets: WidgetModel[];
}

export const createBoard = (name: string = "New Board", widgets: WidgetModel[] = []) => ({ 
    id: crypto.randomUUID(),
    name,
    widgets
});