import {useEffect, useState} from 'react';
import { createBoard } from './models/board';
import { createWidget } from './models/widget';
import { BoardsContext } from './BoardsContext';

export function BoardsProvider({ children }) {
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

    useEffect(() => {
        const boardsString = JSON.stringify(boards);
        localStorage.setItem("boardsString", boardsString);
    }, [boards]);

    useEffect(() => {
        localStorage.setItem("idString", activeBoardId);
    }, [activeBoardId]);

    function addWidget(type) {
        const newWidget = createWidget(type);
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

    const value = { boards, activeBoardId, setBoards, setActiveBoardId, addWidget, removeWidget, updateWidget };

    return (
        <BoardsContext.Provider value={value}>
            {children}
        </BoardsContext.Provider>
    )
}