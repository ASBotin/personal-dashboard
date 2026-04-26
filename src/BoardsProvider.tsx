import {useEffect, useState, ReactNode, useMemo} from 'react';
import { BoardModel, createBoard } from './models/boardModel';
import { WidgetModel, createWidget, WidgetType } from './models/widgetModel';
import { BoardsContext, BoardsContextProps } from './BoardsContext';
import { WIDGET_SIZES } from './widgetConfig';


interface BoardsProviderProps {
    readonly children: ReactNode;   
}

export function BoardsProvider({ children }: BoardsProviderProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

    function toggleSidebar() {
        setIsSidebarOpen(prev => !prev);
    }

    const [boards, setBoards] = useState<BoardModel[]>(() => {
        const boardsFromStorage = localStorage.getItem("boardsString");
        if (boardsFromStorage) {
            try {
                const restoredBoards = JSON.parse(boardsFromStorage);
                return restoredBoards;
            }
            catch (err) {
                console.error("failed parsing boards:", err);
                return [createBoard()]; 
            }
        }
        else {
            return [createBoard()];
        }
    });

    const [activeBoardId, setActiveBoardId] = useState<string>(() => {
        const activeIdFromStorage = localStorage.getItem("idString");
        if (activeIdFromStorage) {
            return activeIdFromStorage;
        }
        else {
            return boards[0].id;
        }
    });
    const [draggedType, setDraggedType] = useState<string | null>(null);

    useEffect(() => {
        const boardsString = JSON.stringify(boards);
        localStorage.setItem("boardsString", boardsString);
    }, [boards]);

    useEffect(() => {
        localStorage.setItem("idString", activeBoardId);
    }, [activeBoardId]);

    function addWidget(type: WidgetType, position: { x: number; y: number; w: number; h: number } | null = null) {
        const activeBoard = boards.find(b => b.id === activeBoardId);
        let finalPosition = position;

        if (!finalPosition) {
            if (!activeBoard) return;
            const widgets = activeBoard.widgets;
            const config = WIDGET_SIZES[type];
            const { w, h } = Object.values(config)[0];

            if (widgets?.length === 0) {
                finalPosition = { x: 0, y: 0, w, h };
            } else {
                const lastWidget = widgets[widgets.length - 1];
                const nextX = lastWidget.position.x + lastWidget.position.w;
                
                const maxCols = 15; 
                if (nextX + w <= maxCols) {
                    finalPosition = { x: nextX, y: lastWidget.position.y, w, h };
                } else {
                    const maxY = Math.max(...widgets.map(w => w.position.y + w.position.h));
                    finalPosition = { x: 0, y: maxY, w, h };
                }
            }
        }

        const newWidget = createWidget(type, { position: finalPosition });
        setBoards((prev: BoardModel[]) => prev.map((board: BoardModel): BoardModel =>
            board.id === activeBoardId ? {
                ...board,
                widgets: [...board.widgets, newWidget]
            } : board
        ))

        return newWidget;
    }

    function removeWidget(id: string) {
        setBoards(prev => prev.map(board => 
            board.id === activeBoardId ? {
                ...board,
                widgets: board.widgets.filter(widget => widget.id !== id)
            } : board
        ))
    }

    function updateWidget(updatedWidget: WidgetModel) {
        setBoards(prev => prev.map(board => 
            board.id === activeBoardId ? {
                ...board,
                widgets: board.widgets.map(widget => 
                    widget.id === updatedWidget.id ? updatedWidget : widget)
            } : board
        ))
    }

    function addBoard() {
        const newBoard = createBoard();
        setBoards(prev => [...prev, newBoard]);
        setActiveBoardId(newBoard.id);
    }

    function removeBoard(id: string) {
        if (id === activeBoardId) {
            const currentBoardIndex = boards.findIndex(board => board.id === id);
            const newActiveBoardId = boards[currentBoardIndex - 1]?.id || boards[currentBoardIndex + 1]?.id;
            if (newActiveBoardId) {
                setActiveBoardId(newActiveBoardId);
            }
        }
        setBoards(prev => {
            const newBoards = prev.filter(board => board.id !== id)
            if (prev.length === 1) {
                const newBoard = createBoard();
                newBoards.push(newBoard);
                setActiveBoardId(newBoard.id);
            }
            return newBoards;
        })
    }

    function renameBoard(id: string, newName: string) {
        setBoards(prev => prev.map(board => 
            board.id === id ? {
                ...board,
                name: newName
            } : board
        ))
    }

    function getActiveBoard(): BoardModel | undefined {
        return boards.find(board => board.id === activeBoardId);
    }

    const value: BoardsContextProps = useMemo(() => ({ 
        boards, 
        activeBoardId,
        isSidebarOpen,
        draggedType, 
        setBoards, 
        setActiveBoardId, 
        addWidget, 
        removeWidget, 
        updateWidget, 
        addBoard, 
        removeBoard, 
        renameBoard, 
        toggleSidebar, 
        setDraggedType,
        getActiveBoard
    }), [boards, activeBoardId, isSidebarOpen, draggedType]);

    return (
        <BoardsContext.Provider value={value}>
            {children}
        </BoardsContext.Provider>
    )
}