import {useEffect, useState, ReactNode, useMemo} from 'react';
import { BoardModel, createBoard } from './models/boardModel';
import { WidgetModel, createWidget, WidgetType } from './models/widgetModel';
import { BoardsContext, BoardsContextProps } from './BoardsContext';
import { WIDGET_SIZES } from './widgetConfig';

const API_URL = import.meta.env.VITE_API_URL;

interface BoardsProviderProps {
    readonly children: ReactNode;   
}

export function BoardsProvider({ children }: BoardsProviderProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [boards, setBoards] = useState<BoardModel[]>([] as BoardModel[]);
    const [draggedType, setDraggedType] = useState<string | null>(null);
    const [activeBoardId, setActiveBoardId] = useState<string>("");
    
    useEffect(() => {
        const loadBoards = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/boards`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    const finalBoards = (data && data.length > 0) ? data : [createBoard()];
                    setBoards(finalBoards);

                    const savedId = localStorage.getItem("idString");
                    if (savedId && finalBoards.some((b: BoardModel) => b.id === savedId)) {
                        setActiveBoardId(savedId);
                    } else {
                        setActiveBoardId(finalBoards[0].id);
                    }
                } else if (response.status === 401) {
                    // Токен невалиден
                    localStorage.removeItem('token');
                    window.location.href = '/auth';
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadBoards();
    }, []);

    useEffect(() => {
        const saveToBackend = async () => {
            const token = localStorage.getItem('token');
            // Не сохраняем, если данных нет или мы еще в процессе первичной загрузки
            if (!token || isLoading || boards.length === 0) return;

            try {
                await fetch(`${API_URL}/boards`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(boards)
                });
            } catch (err) {
                console.error("Save error:", err);
            }
        };

        saveToBackend();
    }, [boards, isLoading]);

    useEffect(() => {
        localStorage.setItem("idString", activeBoardId);
    }, [activeBoardId]);

    function toggleSidebar() {
        setIsSidebarOpen(prev => !prev);
    }

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