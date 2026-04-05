import styles from "./Note.module.css";
import { useState, useRef, useEffect, useContext } from "react";
import CrossButton from "../../ButtonPane/CrossButton/CrossButton";
import ActionButton from "../../ButtonPane/ActionButton/ActionButton";
import ButtonPane from "../../ButtonPane/ButtonPane";
import ListItem from "./ListItem/ListItem";
import AddListItemButton from "./AddListItemButton/AddListItemButton";
import { BoardsContext } from "../../../BoardsContext";
import { Reorder} from "framer-motion";

import { WidgetModel } from "../../../models/widgetModel";


export interface ListItemModel {
    readonly id: string;
    readonly text: string;
    readonly isCompleted: boolean;
}

type AnimatingState = "showing-completed" | "hiding-completed" | null;

export default function Note({ widgetModel }: { widgetModel: WidgetModel }) {
    const [title, setTitle] = useState(widgetModel.data.title || "");
    const [text, setText] = useState(widgetModel.data.text || "");
    const [type, setType] = useState(widgetModel.data.type || "text");
    const [listItems, setListItems] = useState<ListItemModel[]>(widgetModel.data.listItems || []);
    const [showCompleted, setShowCompleted] = useState(false);
    const [animating, setAnimating] = useState<AnimatingState>(null);
    const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

    const { updateWidget, removeWidget } = useContext(BoardsContext);

    const titleRef = useRef<HTMLTextAreaElement | null>(null);
    const textRef = useRef<HTMLTextAreaElement | null>(null);
    const mainContentRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const showCompletedButtonRef = useRef<HTMLButtonElement | null>(null);
    const addDebounce = useRef<ReturnType<typeof setInterval> | undefined>(undefined);


    const active = listItems.filter((item) => !item.isCompleted);
    const completed = listItems.filter((item) => item.isCompleted);

    useEffect(() => {
        autoResize(titleRef);
        autoResize(textRef);
    }, [text, title, type]);

    useEffect(() => {
        if (!animating) return;

        const content = contentRef.current;

        if (!content || !titleRef.current || !showCompletedButtonRef.current) return;
        
        const startHeight = content.getBoundingClientRect().height;
        content.style.height = `${startHeight}px`;

        let finalHeight;
        if (animating === "showing-completed") {
            content.style.setProperty("flex-grow", "0", "important");
            const titleHeight = titleRef.current.scrollHeight;
            const paddingHeight = 24;
            const showCompletedButtonHeight = showCompletedButtonRef.current.scrollHeight;
            finalHeight = titleHeight + paddingHeight + showCompletedButtonHeight + 20;
        } else {
            if (!content.parentElement) return;
            finalHeight = content.parentElement.offsetHeight - 34; 
        }
        requestAnimationFrame(() => {
            content.style.transition = 'height 500ms ease-in-out';
            content.style.height = `${finalHeight}px`;
        });

        const duration = 260;
        const timer = setTimeout(() => {
            setShowCompleted(prev => !prev);
            setAnimating(null);
            content.style.setProperty("flex-grow", "");
            content.style.height = "";

        }, duration);

        return () => clearTimeout(timer);
    }, [animating]);

    function saveChanges(newListItems?: ListItemModel[]) {
        const itemsToSave = newListItems || listItems;
        updateWidget({
            ...widgetModel,
            data: {
                ...widgetModel.data,
                title,
                text,
                type,
                listItems: itemsToSave,
            },
        });
    }

    function autoResize(ref: React.RefObject<HTMLTextAreaElement | null>) {
        const el = ref.current;
        if (!el) return;

        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    }

    const handleTypeChange = (newType: string) => {
        if (newType === type) return;

        let updatedText = text;
        let updatedListItems = [...listItems];

        if (newType === "list") {
        if (text.trim()) {
            const lines = text.split("\n").filter((line: string) => line.trim() !== "");
            updatedListItems = lines.map((line: string) => ({
                id: crypto.randomUUID(),
                text: line,
                isCompleted: false,
            }));
        }
        } else if (newType === "text") {
            if (listItems.length > 0) {
                updatedText = active.map((item: ListItemModel) => item.text).join("\n");
            }
        }

        setType(newType);
        setText(updatedText);
        setListItems(updatedListItems);

        updateWidget({
            ...widgetModel,
            data: {
                ...widgetModel.data,
                type: newType,
                listItems: updatedListItems,
                text: updatedText,
            },
        });
    };

    const handleAddListItem = (afterId: string | null = null) => {
        if (addDebounce.current) return;
        const newItem = {
            id: crypto.randomUUID(),
            text: "",
            isCompleted: false,
        };

        let newListItems;
        
        if (afterId) {
            const index = listItems.findIndex(item => item.id === afterId);
            newListItems = [...listItems];
            newListItems.splice(index + 1, 0, newItem);
        }
        else {
            newListItems = [...active, newItem, ...completed];
        }
        
        setListItems(newListItems);
        setFocusedItemId(newItem.id);
        saveChanges(newListItems); 

        addDebounce.current = setTimeout(() => {
            addDebounce.current = undefined;    
        }, 500);
    };

    const handleUpdateItem = (id: string, newText: string, newIsCompleted: boolean) => {
        const newList = listItems.map((item) =>
            item.id !== id ? item : { id, text: newText, isCompleted: newIsCompleted }
        );
        setListItems(newList);
        saveChanges(newList);
    };

    const handleDeleteItem = (id: string) => {
        const newList = listItems.filter((item) => item.id !== id);
        setListItems(newList);
        saveChanges(newList);
    };

    const pluralize = (length: number) => {
        const mod10 = length % 10;
        const mod100 = length % 100;

        if (mod10 === 1 && mod100 !== 11) {
            return "отмеченный пункт";
        }
        if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) {
            return "отмеченных пункта";
        }
        return "отмеченных пунктов";
    };

    const handleReorder = (newActive: ListItemModel[]) => {
        const newList = [...newActive, ...completed];
        setListItems(newList);
        saveChanges(newList);  
    }

    const actionsOptions = [
        {
            label: "Текст",
            onClick: () => handleTypeChange("text"),
            isActive: type === "text",
        },
        {
            label: "Список",
            onClick: () => handleTypeChange("list"),
            isActive: type === "list",
        },
    ];

    return (
        <div className={`${styles.note} widgetContainer`}>
            <ButtonPane>
                <ActionButton options={actionsOptions} className="note" />
                <CrossButton
                    onClick={() => removeWidget(widgetModel.id)}
                    className="note"
                />
            </ButtonPane>
            <div
                className={`widgetContent ${styles.content} ${!showCompleted || completed.length === 0 || type === "text" ? styles.completedHidden : styles.completedShown}`}
                ref={contentRef}
            >
                <textarea
                    ref={titleRef}
                    rows={1}
                    className={styles.title}
                    value={title}
                    placeholder={type === "text" ? "Заметка" : "Список"}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        autoResize(titleRef);
                    }}
                    onBlur={() => saveChanges()}
                />
                <div 
                    className={`${styles.mainContent} ${animating ? styles.fade : ""} ${showCompleted ? styles.mainHidden : ""}`} 
                    ref={mainContentRef}
                >
                    {type === "text" && (
                        <textarea
                            ref={textRef}
                            className={styles.text}
                            value={text}
                            placeholder="Введите текст заметки..."
                            onChange={(e) => {
                                setText(e.target.value);
                                autoResize(textRef);
                            }}
                            onBlur={() => {
                                saveChanges();
                                autoResize(textRef);
                            }}
                        />
                    )}
                    {type === "list" && (
                        <div className={styles.list}>
                            <Reorder.Group
                                axis="y"
                                values={active}
                                onReorder={handleReorder}
                                className={styles.reorderList}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "12px"
                                }}
                            >
                                {active.map((item) => (
                                    <ListItem
                                        key={item.id}
                                        id={item.id}
                                        item={item}
                                        handleUpdateItem={handleUpdateItem}
                                        handleDeleteItem={handleDeleteItem}
                                        handleAddListItem={handleAddListItem}
                                        focusedItemId={focusedItemId}
                                    />
                                ))}
                            </Reorder.Group>
                        </div>
                    )}
                </div>

                {type === "list" && (
                    <div className={styles.controls}>
                        <div 
                            className={`${styles.alib} ${showCompleted || animating ? styles.alibHidden : ""}`}
                        > 
                            <AddListItemButton 
                                onAdd={() => handleAddListItem()}
                            />
                        </div>
                        {completed.length > 0 && (
                            <button
                                className={styles.showCompletedButton}
                                ref={showCompletedButtonRef}
                                onClick={() => showCompleted ? setAnimating("hiding-completed") : setAnimating("showing-completed")}
                            >
                                {!(showCompleted) ? "+ Показать" : "- Скрыть"} {completed.length}{" "}
                                {pluralize(completed.length)}
                            </button>
                        )}
                    </div>
                )}
            </div>
            <div className={`${styles.completedItems} ${animating ? styles.fade : ""} ${showCompleted ? styles.cs : ""}`}>
                <div className={styles.completedScrollArea}> 
                    <div className={styles.list}>
                        <Reorder.Group
                            axis="y"
                            values={completed}
                            className={styles.reorderList}
                            onReorder={()=>{}}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px"
                            }}
                        >
                            {completed.map((item) => (
                                <ListItem
                                    key={item.id}
                                    id={item.id}
                                    item={item}
                                    handleUpdateItem={handleUpdateItem}
                                    handleDeleteItem={handleDeleteItem}
                                    handleAddListItem={handleAddListItem} 
                                    focusedItemId={focusedItemId}
                                />
                            ))}
                        </Reorder.Group>
                    </div>
                </div>
            </div>
        </div>
    );
}