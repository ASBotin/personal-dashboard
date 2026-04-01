import {useEffect, useState} from 'react';
import { createBoard } from './models/board';
import { createWidget } from './models/widget';
import { BoardsContext } from './BoardsContext';
import { WIDGET_SIZES } from './widgetConfig';

export function BoardsProvider({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    function toggleSidebar() {
        setIsSidebarOpen(prev => !prev);
    }

    const [boards, setBoards] = useState(() => {
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

    const [activeBoardId, setActiveBoardId] = useState(() => {
        const activeIdFromStorage = localStorage.getItem("idString");
        if (activeIdFromStorage) {
            return activeIdFromStorage;
        }
        else {
            return boards[0].id;
        }
    });
    const [draggedType, setDraggedType] = useState(null);

    useEffect(() => {
        const boardsString = JSON.stringify(boards);
        localStorage.setItem("boardsString", boardsString);
    }, [boards]);

    useEffect(() => {
        localStorage.setItem("idString", activeBoardId);
    }, [activeBoardId]);

    function addWidget(type, position = null) {
    const activeBoard = boards.find(b => b.id === activeBoardId);
        let finalPosition = position;

        if (!finalPosition) {
            const widgets = activeBoard.widgets;
            const config = WIDGET_SIZES[type];
            const { w, h } = config.min || Object.values(config)[0];

            if (widgets.length === 0) {
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
        setBoards(prev => prev.map(board =>
            board.id === activeBoardId ? {
                ...board,
                widgets: [...board.widgets, newWidget]
            } : board
        ))
    }

    function removeWidget(id) {
        setBoards(prev => prev.map(board => 
            board.id === activeBoardId ? {
                ...board,
                widgets: board.widgets.filter(widget => widget.id !== id)
            } : board
        ))
    }

    function updateWidget(updatedWidget) {
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

    function removeBoard(id) {
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

    function renameBoard(id, newName) {
        setBoards(prev => prev.map(board => 
            board.id === id ? {
                ...board,
                name: newName
            } : board
        ))
    }

    const value = { boards, activeBoardId, setBoards, setActiveBoardId, addWidget, removeWidget, updateWidget, addBoard, removeBoard, renameBoard, isSidebarOpen, toggleSidebar, draggedType, setDraggedType };

    return (
        <BoardsContext.Provider value={value}>
            {children}
        </BoardsContext.Provider>
    )
}