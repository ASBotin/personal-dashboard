import styles from "./IssuePR.module.css";
import { IssuePRData } from "../GitIssuesPR";
import IssueIcon from "../../../../assets/git/issue.svg?react";
import PRIcon from "../../../../assets/git/git-pull-request.svg?react";
import DraftPRIcon from "../../../../assets/git/git-pull-request-draft.svg?react";
import CommentIcon from "../../../../assets/git/comments.svg?react";
import AddToNoteIcon from "../../../../assets/git/add-to-note.svg?react"; 
import Modal from "../../../../layout/Modal/Modal";
import { useState, useContext } from "react";
import { BoardsContext } from "../../../../BoardsContext";
import { BoardModel } from "../../../../models/boardModel";
import { WidgetModel } from "../../../../models/widgetModel";

export default function IssuePR({issuePRData, userOnlyMode}: {readonly issuePRData: IssuePRData, readonly userOnlyMode : boolean}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { getActiveBoard, addWidget, updateWidget } = useContext(BoardsContext);
    const activeBoard : BoardModel | undefined = getActiveBoard();
    

    const prepareDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'just now';

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return `${diffInDays} days ago`;

        const options: Intl.DateTimeFormatOptions = { 
            day: 'numeric', 
            month: 'short', 
            year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined 
        };
        return `on ${date.toLocaleDateString('en-US', options)}`;
    };

    const getRepoName = (url: string) :string => {
        const parts = url.split('/');
        const owner = parts[4];
        const repo = parts[5];

        return `${owner}/${repo}`;
    }

    const handleAddToNote = (widgetModel: WidgetModel) => {
        const taskText = `[${issuePRData.title} \n \n${issuePRData.html_url}`;

        let currentItems = [];

        if (widgetModel.data.type === 'list') {
            currentItems = [...(widgetModel.data.listItems || [])];
        } else {
            const text = widgetModel.data.text?.trim() || "";
            if (text) {
                currentItems = text.split("\n")
                    .filter((line: string) => line.trim() !== "")
                    .map((line: string) => ({
                        id: crypto.randomUUID(),
                        text: line,
                        isCompleted: false,
                    }));
            }
        }

        const newItem = {
            id: crypto.randomUUID(),
            text: taskText,
            isCompleted: false,
        };

        updateWidget({
            ...widgetModel,
            data: {
                ...widgetModel.data,
                type: 'list',
                listItems: [...currentItems, newItem],
                text: "" 
            }
        });

        setIsModalOpen(false);
    }

    const handleAddToNewNote = () => {
        const newNote = addWidget('note');
        if (!newNote) throw console.error("Не удалось создать заметку");
        handleAddToNote(newNote);
        setIsModalOpen(false);
    }

    return (
        <div className={styles.issuePR}>
            <div className={styles.iconContainer}>
                {'draft' in issuePRData ?
                    issuePRData.draft === true ?
                        <DraftPRIcon className={`${styles.mainIcon} ${styles.grayIcon}`}/> 
                    :
                        <PRIcon className={`${styles.mainIcon} ${styles.greenIcon}`}/>
                : 
                <IssueIcon className={`${styles.mainIcon} ${styles.greenIcon}`}/>}
            </div>
            <div className={styles.wrapper}>
                <h3 className={styles.title}>
                    <a 
                        className={styles.link}
                        href={issuePRData.html_url}
                        target="_blank" 
                        rel="noreferrer" 
                    >
                        {issuePRData.title}
                    </a>
                </h3>
                <div className={styles.details}>
                    <div className={styles.number}>#{issuePRData.number}</div>
                    <div>·</div>
                    <div className={styles.meta}>
                        {issuePRData.author_association === 'NONE' ? "" : <span className={styles.association}>{issuePRData.author_association}</span>} 
                        {<a href={issuePRData.user.html_url} target="_blank" rel="noreferrer" className={styles.link}>
                            {!userOnlyMode && (
                                <span>{issuePRData.user.login}</span>
                            )}
                        </a>} 
                        <span>posted {prepareDate(issuePRData.created_at)}</span>
                        {userOnlyMode && (
                            <>
                                <span>·</span>
                                <a href={issuePRData.repository_url} target="_blank" rel="noreferrer" className={styles.link}>
                                    <span>{getRepoName(issuePRData.repository_url)}</span>
                                </a>
                            </>
                        )}
                    </div>
                    {issuePRData.comments > 0 && (
                        <>
                            <div>·</div>
                            <div className={styles.comments}><CommentIcon className={`${styles.smallIcon} ${styles.grayIcon}`}/> {issuePRData.comments}</div>
                        </>
                    )}
                </div>
                
            </div>
            <div className={styles.addToNote}>
                <button 
                    className={styles.addToNoteButton} 
                    onClick={() => setIsModalOpen(true)}
                    title="Добавить в список"
                >
                    <AddToNoteIcon className={styles.noteIcon}/>
                </button>
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Добавить в список"
            >
                <div className={styles.notesList}>
                    {activeBoard?.widgets.map(w => (
                        w.type === 'note' ?
                            <button 
                                key={w.id}
                                className={styles.noteButton}
                                onClick={() => handleAddToNote(w)}
                            >
                                {w.data.title ? w.data.title : (w.data.type === 'list' ? "Список" : "Заметка")}
                            </button>
                        : null
                    ))}
                </div>
                <div className={styles.buttonWrapper}>
                    <button 
                        className={styles.newNoteButton}
                        onClick={() => handleAddToNewNote()}
                    >
                        + Добавить в новый список
                    </button>
                </div>
            </Modal>
        </div>
    )
}