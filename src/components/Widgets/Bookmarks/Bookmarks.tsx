import styles from './Bookmarks.module.css';
import ButtonPane from '../../ButtonPane/ButtonPane';
import CrossButton from '../../ButtonPane/CrossButton/CrossButton';

import { FormEvent, useContext, useState } from 'react';
import { BoardsContext } from '../../../BoardsContext';
import { WidgetModel } from '../../../models/widgetModel';
import Modal from '../../../layout/Modal/Modal';

interface Bookmark {
    id: string;
    title: string;
    url: string;
}

export default function Bookmarks({widgetModel} : {readonly widgetModel: WidgetModel}) {
    const {removeWidget, updateWidget} = useContext(BoardsContext);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(widgetModel.data?.bookmarks || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
    const [newBookmarkUrl, setNewBookmarkUrl] = useState('');
    

    const getFaviconUrl = (url: string) => {
    try {
        const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
        const domain = new URL(formattedUrl).hostname; 
        return `https://www.google.com/s2/favicons?sz=64&domain=${domain}&sz=100`;
        } catch (error) {
            console.error('Error occurred while fetching favicon URL:', error);
            return ''; 
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        if (newBookmarkTitle.trim() || newBookmarkUrl.trim()) {
            const formattedUrl = newBookmarkUrl.startsWith('http') ? newBookmarkUrl : `https://${newBookmarkUrl}`;
            setBookmarks(prev => {
                const updatedBookmarks = [...prev, {id: crypto.randomUUID(), title: newBookmarkTitle, url: formattedUrl }];
                updateWidget({
                    ...widgetModel,
                    data: {
                        ...widgetModel.data,
                        bookmarks: updatedBookmarks
                    }
                });
                return updatedBookmarks;
            });
            setNewBookmarkTitle('');
            setNewBookmarkUrl('');
            setIsModalOpen(false);
        }
        
    }

    const handleDeleteBookmark = (bookmark: Bookmark) => {
        setBookmarks(prev => prev.filter(b => b.id !== bookmark.id));
        updateWidget({
            ...widgetModel,
            data: {
                ...widgetModel.data,
                bookmarks: bookmarks.filter(b => b.id !== bookmark.id)
            }
        });
    }

    return (
        <div className={`${styles.bookmarks} widgetContainer`}>
            <ButtonPane>
                <CrossButton
                    onClick={() => removeWidget(widgetModel.id)}
                    className = "pomodoro"
                />
            </ButtonPane>
            <div className = {`${styles.content} widgetContent`}>
                <div className={styles.bookmarksGrid}>
                    {bookmarks.map((bookmark, index) => (
                        <div key={index} className={styles.gridEl}>
                            <button 
                                className={styles.deleteButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteBookmark(bookmark);
                                }}
                            >×</button>
                            <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className={styles.bookmark}>
                                <img src={getFaviconUrl(bookmark.url)} alt={`${bookmark.title} favicon`} className={styles.favicon} />
                            </a>
                            <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className={styles.bookmark}>
                                <span className={styles.title}>{bookmark.title}</span>
                            </a>
                        </div>
                    ))}
                </div>
                <div className={styles.buttonContainer}>
                    <button
                        className={styles.addButton}
                        onClick={() => setIsModalOpen(true)}
                    >Новая закладка</button>
                </div>
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Добавить закладку"
            >
                <div className={styles.modalContent}>
                    <form 
                        className={styles.formContainer}
                        onSubmit={handleSubmit}
                    >
                        <div className={styles.formItem}>
                            <label>Название</label>
                            <input 
                                type="text"
                                value={newBookmarkTitle}
                                onChange={(e) => setNewBookmarkTitle(e.target.value)}
                            />
                            
                        </div>
                        <div className={styles.formItem}>
                            <label>URL</label>
                            <input
                                type="text"
                                value={newBookmarkUrl}
                                onChange={(e) => setNewBookmarkUrl(e.target.value)}
                            />
                        </div>
                        
                        <button 
                            className={styles.saveButton} 
                            type="submit"
                            disabled={!newBookmarkTitle.trim() || !newBookmarkUrl.trim()}
                        >Сохранить</button>
                    </form>
                </div>

            </Modal>
        </div>
    )
}