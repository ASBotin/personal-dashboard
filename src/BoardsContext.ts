import {createContext, Dispatch, SetStateAction} from 'react';
import { BoardModel } from './models/boardModel';
import { WidgetModel, WidgetType } from './models/widgetModel'; 

export interface BoardsContextProps {
    boards: BoardModel[];
    activeBoardId: string;
    isSidebarOpen: boolean;
    draggedType: string | null;
    setBoards: Dispatch<SetStateAction<BoardModel[]>>;
    setActiveBoardId: Dispatch<SetStateAction<string>>;
    addWidget: (type: WidgetType, position?: { x: number; y: number; w: number; h: number }) => void;
    removeWidget: (id: string) => void;
    updateWidget: (updatedWidget: WidgetModel) => void;
    addBoard: () => void;
    removeBoard: (id: string) => void;
    renameBoard: (id: string, newName: string) => void;
    toggleSidebar: () => void;
    setDraggedType: Dispatch<SetStateAction<string | null>>;
}

export const BoardsContext = createContext<BoardsContextProps>({} as BoardsContextProps); 
