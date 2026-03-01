import styles from './RepositoryTracker.module.css';
import ButtonPane from '../../ButtonPane/ButtonPane';
import CrossButton from '../../ButtonPane/CrossButton/CrossButton';
import ActionButton from '../../ButtonPane/ActionButton/ActionButton';

import Star from '../../../assets/git/star.svg?react';
import Fork from '../../../assets/git/fork.svg?react';
import Issue from '../../../assets/git/issue.svg?react';
import Watch from '../../../assets/git/watchers.svg?react';

import { useState, useEffect, useContext } from 'react';
import { BoardsContext } from '../../../BoardsContext';
import { getReposData } from '../../../api/githubApi';


export default function RepositoryTracker({widgetModel}) {
    const {updateWidget, removeWidget} = useContext(BoardsContext);
    const [repos, setRepos] = useState({
        owner: "ASBotin",
        repos: "personal-dashboard"
    });
    const [reposData, setReposData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [ownerInput, setOwnerInput] = useState('');
    const [repoInput, setRepoInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault(); 
        if (ownerInput.trim() && repoInput.trim()) {
            setRepos({ 
                owner: ownerInput.trim(), 
                repos: repoInput.trim() 
            });
        }
    };

    useEffect(() => {
        const owner = repos?.owner;
        const rep = repos?.repos;

        if  (owner && rep) {
            const fetchReposData = async () => {
                setIsLoading(true);
                try {
                    const data = await getReposData(owner, rep);
                    setReposData(data);
                    console.log("Fetched repos data:", data);
                }
                catch (err) {
                    console.error("Repos data fetch error:", err);
                }
                finally {
                    setIsLoading(false);
                }
            }
            fetchReposData();
        }

    }, [repos])

    const actionsOptions = [
        { label: "Сменить репозиторий", onClick: () => setRepos(null)},
    ];

    return (
        <div className={styles.reposTracker}>
            <ButtonPane>
                {repos && (
                    <ActionButton
                        options={actionsOptions}
                        className="reposTracker"
                    />
                )}
                <CrossButton 
                    onClick = {() => removeWidget(widgetModel.id)}
                    className="reposTracker"
                /> 
            </ButtonPane>
            <div className = {styles.content}>
                {!repos && (
                    <form className={styles.formContainer} onSubmit={handleSubmit}>
                        <h4 className={styles.formTitle}>Настройка трекера</h4>
                        
                        <div className={styles.inputGroup}>
                            <input 
                                type="text" 
                                placeholder="Владелец" 
                                value={ownerInput}
                                onChange={(e) => setOwnerInput(e.target.value)}
                                className={styles.repoInput}
                                required
                            />
                            <input 
                                type="text" 
                                placeholder="Репозиторий" 
                                value={repoInput}
                                onChange={(e) => setRepoInput(e.target.value)}
                                className={styles.repoInput}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className={styles.submitBtn}
                            disabled={!ownerInput || !repoInput}
                        >
                            Начать отслеживание
                        </button>
                    </form>
                )}
                {repos && isLoading && (
                    <div className={styles.loader}>
                        Загрузка...
                    </div>
                )}
                {repos && !isLoading && reposData && (
                    <div className={styles.reposInfo}>
                        <div className={styles.container}>
                            <h2 className={styles.reposName}>{reposData.name}</h2>
                            <p className={styles.reposDescription}>{reposData?.description}</p>
                            <div className={styles.otherData}>
                                <div className={styles.otherDataItem}>Владелец: {repos.owner}</div>
                                <div className={styles.otherDataItem}>Язык: {reposData.language}</div>
                                <div className={styles.otherDataItem}>
                                    Обновлен: {new Date(reposData.updated_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <div className={`${styles.container} ${styles.details}`}>
                            <div className={styles.reposStats}>
                                <span className={styles.statItem}><Star className={styles.starIcon} /> {reposData?.stargazers_count}</span>
                                <span className={styles.statItem}><Fork className={styles.forkIcon} /> {reposData?.forks_count}</span>
                                <span className={styles.statItem}><Issue className={styles.issueIcon} /> {reposData?.open_issues_count}</span>
                                <span className={styles.statItem}><Watch className={styles.watchIcon} /> {reposData?.watchers_count}</span>
                            </div>
                        </div>
                        
                    </div>
                )}                
            </div>
        </div>
    )
}