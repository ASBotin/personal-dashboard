import styles from "./WidgetBoard.module.css";
import Widget from "../../components/Widgets/Widget";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { Responsive as ResponsiveGridLayout, Layout, LayoutItem } from 'react-grid-layout';
import { useState, useLayoutEffect, useRef, useContext, useMemo, useCallback } from "react";
import { BoardsContext } from "../../BoardsContext";
import { WIDGET_SIZES } from "../../widgetConfig";
import { WidgetModel, WidgetType } from "../../models/widgetModel"; 

export default function WidgetBoard({ widgets }: {readonly widgets: WidgetModel[]}) {
    const containerRef = useRef(null);
    const [width, setWidth] = useState(0);
    const { setBoards, activeBoardId, addWidget, draggedType, setDraggedType } = useContext(BoardsContext);

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        let timeoutId: number | undefined = undefined;
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
        return widgets.map(w => {
            const config = WIDGET_SIZES[w.type] || {};

            const widths = Object.values(config)?.map(size => size.w);
            const heights = Object.values(config)?.map(size => size.h);

            const minW = widths.length > 0 ? Math.min(...widths) : 2;
            const maxW = widths.length > 0 ? Math.max(...widths) : 16;
            const minH = heights.length > 0 ? Math.min(...heights) : 2;
            const maxH = heights.length > 0 ? Math.max(...heights) : 12;

            return {
                i: String(w.id),
                x: w.position.x,
                y: w.position.y,
                w: w.position.w || minW,
                h: w.position.h || minH,
                minW, minH, maxW, maxH,
                isResizable: minW !== maxW || minH !== maxH
            }
        });
    }, [widgets]);

    const handleActionStop = useCallback((newLayout: Layout) => {
        setBoards(prev => prev.map(board => {
            if (board.id !== activeBoardId) return board;

            const updatedWidgets = board.widgets.map(widget => {
                const newPos = newLayout.find((l: LayoutItem) => l.i === String(widget.id));
                if (!newPos) return widget;
                return {
                    ...widget,
                    position: { x: newPos.x, y: newPos.y, w: newPos.w, h: newPos.h }
                };
            });

            return { ...board, widgets: updatedWidgets };
        }));
    }, [activeBoardId, setBoards]);

    const droppingItem = useMemo(() => {
        if (!draggedType || !WIDGET_SIZES[draggedType as keyof typeof WIDGET_SIZES]) {
            return {
                i: 'empty',
                w:0,
                h:0,
                x:0,
                y:0
            } 
        }

        const config = WIDGET_SIZES[draggedType as keyof typeof WIDGET_SIZES];
        const size = Object.values(config)[0]; 

        return {
            i: '__dropping-elem__',
            w: size.w,
            h: size.h,
            x:0,
            y:0
        };
    }, [draggedType]);

    const isWidgetBeingDragged = useMemo(() => {
        return !!draggedType && !!WIDGET_SIZES[draggedType as keyof typeof WIDGET_SIZES];
    }, [draggedType]);

    const dropConfig = {
        enabled: isWidgetBeingDragged,
        defaultItem: { w: 2, h: 2 } 
    };

    const handleResize = (
        _layout: readonly LayoutItem[], 
        _oldItem: LayoutItem | null, 
        newItem: LayoutItem | null,
        placeholder: LayoutItem | null
    ) => {
        if (!newItem) return;

        const widget = widgets.find(w => w.id === newItem.i);
        if (!widget) return;

        const flexibleTypes: WidgetType[] = ['note', 'gitIssuesPR'];
        if (flexibleTypes.includes(widget.type)) return;

        const sizes = WIDGET_SIZES[widget.type as keyof typeof WIDGET_SIZES];
        if (!sizes) return;

        const availablePresets = Object.values(sizes);
        
        const closest = availablePresets.reduce((prev, curr) => {
            const prevDist = Math.abs(prev.w - newItem.w) + Math.abs(prev.h - newItem.h);
            const currDist = Math.abs(curr.w - newItem.w) + Math.abs(curr.h - newItem.h);
            return currDist < prevDist ? curr : prev;
        });

        newItem.w = closest.w;
        newItem.h = closest.h;

        if (placeholder) {
            placeholder.w = closest.w;
            placeholder.h = closest.h;
        }
    };

    const handleDrop = (layout: Layout, item: LayoutItem | undefined, e: Event) => {
        const dragEvent = e as unknown as React.DragEvent;
        const type = dragEvent.dataTransfer?.getData("text/plain");
        
        if (item && type && WIDGET_SIZES[type as WidgetType]) {
            addWidget(type as WidgetType, { x: item.x, y: item.y, w: item.w, h: item.h });
        }
        setDraggedType(null);
        document.body.style.cursor = 'default';
    };

    return (
        <div 
            ref={containerRef} 
            className={styles.widgetBoard}
        >
            {width > 0 ? (
                <ResponsiveGridLayout
                    className="layout"
                    layouts={{
                        lg: currentLayout,
                        md: currentLayout,
                        sm: currentLayout,
                        xs: currentLayout,
                        xxs: currentLayout
                    }}
                    breakpoints={{ lg: 1400, md: 1200, sm: 900, xs: 600, xxs: 350 }}
                    cols={{ lg: 15, md: 12, sm: 9, xs: 6, xxs: 3}}
                    rowHeight={40}
                    width={Math.floor(width)}
                    dragConfig={{ enabled: true, handle: '.widget-drag-handle' }}
                    onDragStart={() => {
                        document.body.style.cursor = 'grabbing';
                    }}
                    onDragStop={(layout) => { 
                        handleActionStop(layout);
                        document.body.style.cursor = 'default';
                    }}
                    onResize={handleResize}
                    onResizeStop={handleActionStop}    
                    margin={[20, 20]}
                    dropConfig={dropConfig}
                    onDrop={handleDrop}
                    droppingItem={droppingItem}
                    style={{ minHeight: '80vh' }}
                >
                    {widgets.map(widget => (
                        <div 
                            key={String(widget.id)}
                            data-grid={currentLayout.find(l => l.i === String(widget.id))}
                        >
                            <Widget widgetModel={widget} />
                        </div>
                    ))}
                </ResponsiveGridLayout>
            ) : (
                <div>Загрузка сетки...</div>
            )}
        </div>
    );
}