import styles from './RepositoryTracker.module.css';
import ButtonPane from '../../ButtonPane/ButtonPane';
import CrossButton from '../../ButtonPane/CrossButton/CrossButton';
import ActionButton from '../../ButtonPane/ActionButton/ActionButton';

import Star from '../../../assets/git/star.svg?react';
import Fork from '../../../assets/git/fork.svg?react';
import Issue from '../../../assets/git/issue.svg?react';
import Watch from '../../../assets/git/watchers.svg?react';

import { useState, useEffect, useContext, useRef, FormEvent } from 'react';
import { BoardsContext } from '../../../BoardsContext';
import { fetchReposData } from '../../../api/githubApi';

import { WidgetModel } from '../../../models/widgetModel';
import { WIDGET_SIZES } from '../../../widgetConfig';

interface ReposData {
    html_url: string;
    name: string;
    language: string;
    updated_at: string;
    description: string;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    watchers_count: number;
}

export default function RepositoryTracker({widgetModel}: {widgetModel: WidgetModel}) {
    const {updateWidget, removeWidget} = useContext(BoardsContext);
    const [repos, setRepos] = useState(widgetModel.data.repos || null);
    const [reposData, setReposData] = useState<ReposData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [ownerInput, setOwnerInput] = useState<string>('');
    const [repoInput, setRepoInput] = useState<string>('');

    const [error, setError] = useState<string | null>(null);

    const fetchInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    const h = widgetModel.position.h;
    const isSmall : boolean = (h === WIDGET_SIZES.repositoryTracker.small.h);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); 
        if (ownerInput.trim() && repoInput.trim()) {
            setError(null);
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
            const getReposData = async (silent = false) => {
                if (!silent) setIsLoading(true);
                try {
                    const data = await fetchReposData(owner, rep);
                    if (data) {
                        setReposData(data);
                    }
                    else {
                        setError("Репозиторий не найден");
                        setRepos(null);
                    }
                }
                catch (err) {
                    console.error("Repos data fetch error:", err);
                }
                finally {
                    if (!silent) setIsLoading(false);
                }
            }
            getReposData();
            updateWidget({
                ...widgetModel,
                data: {
                    ...widgetModel.data,
                    repos: { owner, repos: rep }
                }
            })
            fetchInterval.current = setInterval(getReposData, 600000, true);
            return () => clearInterval(fetchInterval.current);
        }    
    }, [repos])

    const actionsOptions = [
        { label: "Сменить репозиторий", onClick: () => setRepos(null)},
    ];

    const prepareNumber = (num: number) => {
        if (num >= 10000 && num < 1000000) {
            return Math.round((num / 1000) * 10) / 10 + "к";
        }
        else if (num > 1000000) {
            return Math.round(num / 1000) + "к";
        }
        return num;
    }

    return (
        <div className={`${styles.reposTracker} widgetContainer`}>
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
            <div className = {`${styles.content} widgetContent`}>
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
                            {error && <div className={styles.errorMessage}>{error}</div>}
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
                <div className={styles.reposInfo}>
                    {repos && !isLoading && reposData && !isSmall && (
                        <div className={styles.container}>
                            <h2 className={styles.reposName}>
                                <a 
                                    href={reposData.html_url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className={styles.repoLink}
                                >
                                    {reposData.name}
                                </a>
                            </h2>
                            <p className={styles.reposDescription}>{reposData?.description}</p>
                            <div className={styles.otherData}>
                                <div className={styles.otherDataItem}>Владелец: {repos.owner}</div>
                                <div className={styles.otherDataItem}>Язык: {reposData.language}</div>
                                <div className={styles.otherDataItem}>
                                    Обновлен: {new Date(reposData.updated_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    )}
                    {repos && !isLoading && reposData && isSmall && (
                        <div className={styles.nameWrapper}>
                            <h2 className={styles.reposNameSmall}>
                                <a 
                                    href={reposData.html_url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className={styles.repoLink}
                                >
                                    {repos.owner}/{reposData.name}
                                </a>
                            </h2>
                        </div>
                    )}
                    {repos && !isLoading && reposData && (
                        <div className={`${styles.container} ${styles.details}`}>
                            <div className={styles.reposStats}>
                                <span className={styles.statItem} title='stargazers'><Star className={styles.starIcon} /> {prepareNumber(reposData?.stargazers_count)}</span>
                                <span className={styles.statItem} title='forks'><Fork className={styles.forkIcon} /> {prepareNumber(reposData?.forks_count)}</span>
                                <span className={styles.statItem} title='issues'><Issue className={styles.issueIcon} /> {prepareNumber(reposData?.open_issues_count)}</span>
                                <span className={styles.statItem} title='watchers'><Watch className={styles.watchIcon} /> {prepareNumber(reposData?.watchers_count)}</span>
                            </div>
                        </div>
                    )}
                </div>                
            </div>
        </div>
    )
}