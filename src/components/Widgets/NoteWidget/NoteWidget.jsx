import styles from "./NoteWidget.module.css";
import { useState, useRef, useEffect, useContext } from "react";
import CrossButton from "../../ButtonPane/CrossButton/CrossButton";
import ActionButton from "../../ButtonPane/ActionButton/ActionButton";
import ButtonPane from "../../ButtonPane/ButtonPane";
import ListItem from "./ListItem/ListItem";
import AddListItemButton from "./AddListItemButton/AddListItemButton";
import { BoardsContext } from "../../../BoardsContext";

export default function NoteWidget({ widgetModel }) {
    const [title, setTitle] = useState(widgetModel.data.title || "");
    const [text, setText] = useState(widgetModel.data.text || "");
    const [type, setType] = useState(widgetModel.data.type || "text");
    const [listItems, setListItems] = useState(widgetModel.data.listItems || []);
    const [showCompleted, setShowCompleted] = useState(false);
    const [animating, setAnimating] = useState(null);

    const { updateWidget, removeWidget } = useContext(BoardsContext);

    const titleRef = useRef(null);
    const textRef = useRef(null);
    const mainContentRef = useRef(null);

    const contentRef = useRef(null);
    const showCompletedButtonRef = useRef(null);


    const active = listItems.filter((item) => !item.isCompleted);
    const completed = listItems.filter((item) => item.isCompleted);

    useEffect(() => {
        if (animating) return;
        if (mainContentRef.current && type === "list") {
            const container = mainContentRef.current;
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [active.length, type, animating])

    useEffect(() => {
        autoResize(titleRef);
        autoResize(textRef);
    }, [text, title, type]);

    useEffect(() => {
        if (!animating) return;

        const content = contentRef.current;
        
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

    function saveChanges(newListItems) {
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

    function autoResize(ref) {
        const el = ref.current;
        if (!el) return;

        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    }

    const handleTypeChange = (newType) => {
        if (newType === type) return;

        let updatedText = text;
        let updatedListItems = [...listItems];

        if (newType === "list") {
        if (text.trim()) {
            const lines = text.split("\n").filter((line) => line.trim() !== "");
                updatedListItems = lines.map((line) => ({
                id: crypto.randomUUID(),
                text: line,
                isCompleted: false,
            }));
        }
        } else if (newType === "text") {
            if (listItems.length > 0) {
                updatedText = active.map((item) => item.text).join("\n");
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

    const handleAddListItem = () => {
        const newItem = {
            id: crypto.randomUUID(),
            text: "",
            isCompleted: false,
        };
        const newListItems = [...listItems, newItem];
        setListItems(newListItems);
        saveChanges(newListItems);
    };

    const handleUpdateItem = (id, newText, newIsCompleted) => {
        const newList = listItems.map((item) =>
            item.id !== id ? item : { id, text: newText, isCompleted: newIsCompleted }
        );
        setListItems(newList);
        saveChanges(newList);
    };

    const handleDeleteItem = (id) => {
        const newList = listItems.filter((item) => item.id !== id);
        setListItems(newList);
        saveChanges(newList);
    };

    const pluralize = (length) => {
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
                            {active.map((item) => (
                                <ListItem
                                    key={item.id}
                                    id={item.id}
                                    text={item.text}
                                    isCompleted={item.isCompleted}
                                    handleUpdateItem={handleUpdateItem}
                                    handleDeleteItem={handleDeleteItem}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {type === "list" && (
                    <div className={styles.controls}>
                        <div 
                            className={`${styles.alib} ${showCompleted || animating ? styles.alibHidden : ""}`}
                        > 
                            <AddListItemButton 
                                onAdd={handleAddListItem}
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
                        {completed.map((item) => (
                            <ListItem
                                key={item.id}
                                id={item.id}
                                text={item.text}
                                isCompleted={item.isCompleted}
                                handleUpdateItem={handleUpdateItem}
                                handleDeleteItem={handleDeleteItem}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}