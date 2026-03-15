import styles from "./WidgetBoard.module.css" 
import Widget from "../../components/Widgets/Widget"
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { Responsive as ResponsiveGridLayout } from 'react-grid-layout';
import { useState, useLayoutEffect, useRef, useContext, useMemo, useCallback } from "react";
import { BoardsContext } from "../../BoardsContext";

export default function WidgetBoard({ widgets }) {
    const containerRef = useRef(null);
    const [width, setWidth] = useState(0);
    const { setBoards, activeBoardId } = useContext(BoardsContext);

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        let timeoutId = null;
        const observer = new ResizeObserver((entries) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const newWidth = Math.floor(entries[0].contentRect.width);
                if (newWidth > 0) {
                    setWidth(newWidth);
                }
            }, 100); 
        });

        observer.observe(containerRef.current);
        return () => {
            observer.disconnect();
            clearTimeout(timeoutId);
        };
    }, []);

    const currentLayout = useMemo(() => {
        return widgets.map(w => ({
            i: String(w.id),
            x: Number(w.position.x) || 0,
            y: Number(w.position.y) || 0,
            w: Number(w.position.w) || 2,
            h: Number(w.position.h) || 2
        }));
    }, [widgets]);

    const handleActionStop = useCallback((newLayout) => {
        setBoards(prev => prev.map(board => {
            if (board.id !== activeBoardId) return board;

            const updatedWidgets = board.widgets.map(widget => {
                const newPos = newLayout.find(l => l.i === String(widget.id));
                if (!newPos) return widget;
                return {
                    ...widget,
                    position: { x: newPos.x, y: newPos.y, w: newPos.w, h: newPos.h }
                };
            });

            return { ...board, widgets: updatedWidgets };
        }));
    }, [activeBoardId, setBoards]);

    return (
        <div 
            ref={containerRef} 
            className={styles.widgetBoard} 
            style={{ 
                width: '100%', 
                height: '100%', 
                minHeight: '80vh',
                overflowX: 'hidden' 
            }}
        >
            {width > 0 ? (
                <ResponsiveGridLayout
                    className="layout"
                    layouts={{ lg: currentLayout }}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 16, md: 12, sm: 8, xs: 6, xxs: 2 }}
                    rowHeight={30}
                    width={width}
                    draggableHandle=".widget-drag-handle"
                    onDragStop={handleActionStop}
                    onResizeStop={handleActionStop}
                    measureBeforeMount={false}
                    useCSSTransforms={true} 
                    margin={[15, 15]}
                >
                    {widgets.map(widget => (
                        <div key={String(widget.id)}>
                            <Widget widgetModel={widget} />
                        </div>
                    ))}
                </ResponsiveGridLayout>
            ) : (
                <div style={{ padding: '20px' }}>Загрузка сетки...</div>
            )}
        </div>
    );
}