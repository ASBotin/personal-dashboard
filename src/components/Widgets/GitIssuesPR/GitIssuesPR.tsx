import styles from "./GitIssuesPR.module.css";
import { WidgetModel } from "../../../models/widgetModel";
import ButtonPane from "../../ButtonPane/ButtonPane";
import CrossButton from "../../ButtonPane/CrossButton/CrossButton";
import ActionButton from "../../ButtonPane/ActionButton/ActionButton";
import { useContext, useState, useEffect, FormEvent, useRef } from "react";
import { BoardsContext } from "../../../BoardsContext";
import { fetchIssuesPRData } from "../../../api/githubApi";
import IssuePR from "./IssuePR/IssuePR";

import Question from "../../../assets/git/question.svg?react";


export interface IssuePRData {
    id: number;
    number: number;
    title: string;
    body: string;
    html_url: string;
    user: {
        html_url: string;
        login: string;
    };
    comments: number;
    created_at: string;
    author_association: string;
    repository_url: string;
    draft?: boolean;
}

interface IssuesPRData {
    issues: IssuePRData[];
    issuesTotal: number;
    pullRequests: IssuePRData[];
    pullRequestsTotal: number;
}

export default function GitIssuesPR({widgetModel}: {readonly widgetModel: WidgetModel}) {
    const {removeWidget, updateWidget} = useContext(BoardsContext);

    const [issuesPRData, setIssuesPRData] = useState<IssuesPRData | undefined>(undefined);

    const [username, setUsername] = useState<string>(widgetModel.data.username || "");
    const [owner, setOwner] = useState<string>(widgetModel.data.owner || "");
    const [repo, setRepo] = useState<string>(widgetModel.data.repo || "");
    const [page, setPage] = useState<number>(1);

    const [usernameInput, setUsernameInput] = useState<string>("");
    const [ownerInput, setOwnerInput] = useState<string>("");
    const [repoInput, setRepoInput] = useState<string>("");
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<"issues" | "pullRequests">("issues");

    const fetchInterval = useRef<undefined | ReturnType<typeof setInterval>>(undefined);

    let userOnlyMode: boolean = (username && !owner && !repo) ? true : false
    useEffect(() => {
        if (!username && !(owner && repo)) {
            setIssuesPRData(undefined);
        }
        else if (username || (owner && repo)) {
            const getIssuesPR = async (silent = false) => {
                if (!silent) setIsLoading(true);
                try {
                    const data : IssuesPRData | null = await fetchIssuesPRData(username, owner, repo, page, activeTab);
                    if (data) {
                        setIssuesPRData(prev => {
                            return {
                                issues: page === 1 ? data.issues : (activeTab === 'issues' ? data.issues : prev?.issues || []),
                                pullRequests: page === 1 ? data.pullRequests : (activeTab === 'pullRequests' ? data.pullRequests : prev?.pullRequests || []),
                                issuesTotal: data.issuesTotal || prev?.issuesTotal || 0,
                                pullRequestsTotal: data.pullRequestsTotal || prev?.pullRequestsTotal || 0,
                            };
                        });
                        userOnlyMode = (username && !owner && !repo) ? true : false;
                    }
                    else {
                        setError("Данные не найдены");
                    }
                }
                catch (err) {
                    console.error("Data fetch error:", err);
                    setError("Данные не найдены");
                    setUsername("");
                    setOwner("");
                    setRepo("");
                    setIssuesPRData(undefined);
                }
                finally {
                    if (!silent) setIsLoading(false);
                }
            }
            getIssuesPR();
            updateWidget({
                ...widgetModel,
                data: {
                    owner,
                    repo,
                    username
                }
            })
            fetchInterval.current = setInterval(getIssuesPR, 60000, true);

            return () => clearInterval(fetchInterval.current);
        } 
    }, [username, owner, repo, page, activeTab]);

    const getTotalPages = (): number => {
        if (!issuesPRData) return 0;
        const totalItems = activeTab === "issues" 
            ? issuesPRData.issuesTotal 
            : issuesPRData.pullRequestsTotal;
        return Math.ceil(totalItems / 20);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); 
        if (usernameInput.trim()) {
            setError(null);
            setUsername(usernameInput);
        }
        if (ownerInput.trim() && repoInput.trim()) {
            setOwner(ownerInput);
            setRepo(repoInput);
        }
    };

    const actionsOptions = [
        { label: "Изменить данные", onClick: () => {
            setUsername("");
            setRepo("");
            setOwner("");
        }},
    ];

    return (
        <div className={`${styles.gitIssuesPR} widgetContainer`}>
            <ButtonPane>
                {(username || repo && owner) && (
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
                {(!username && !(owner && repo)) && (
                    <form className={styles.formContainer} onSubmit={handleSubmit}>
                        <h3 className={styles.formTitle}>Настройка трекера</h3>
                        <div className={styles.inputGroup}>
                            <div className={styles.formSubtitleContainer}>
                                <h4 className={styles.formSubtitle}>Репозиторий</h4>
                                <div
                                    className={styles.tooltipWrapper}
                                    data-tooltip="Укажите владельца и название репозитория для отслеживания issues и pull requests. Можно оставить эти поля пустыми, если хотите отслеживать активность конкретного пользователя везде."
                                >
                                    <Question className={styles.question}/>
                                </div>
                            </div>
                            <input
                                type="text"
                                placeholder="Владелец"
                                value={ownerInput}
                                onChange={(e) => setOwnerInput(e.target.value)}
                                className={styles.formInput}
                            />
                            <input
                                type="text"
                                placeholder="Репозиторий"
                                value={repoInput}
                                onChange={(e) => setRepoInput(e.target.value)}
                                className={styles.formInput}
                            />
                            <div className={styles.formSubtitleContainer}>
                                <h4 className={styles.formSubtitle}>Пользователь</h4>
                                <div 
                                    className={styles.tooltipWrapper}
                                    data-tooltip="Можно указать имя пользователя, чтобы отслеживать его активность. Если оставить пустым, будут отображаться все открытые issues и PR в репозитории."
                                >
                                    <Question className={styles.question}/>
                                </div>
                                
                            </div>
                            <input
                                type="text"
                                placeholder="Пользователь"
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                className={styles.formInput}
                            />
                            {error && <div className={styles.errorMessage}>{error}</div>}
                        </div>

                        <button 
                            type="submit" 
                            className={styles.submitBtn}
                            disabled={!(ownerInput && repoInput) && !usernameInput}
                        >
                            Начать отслеживание
                        </button>
                    </form>
                    
                )}
                {issuesPRData && (
                    <div className={styles.tabs}>
                        <button 
                            className={`${styles.tab} ${activeTab === 'issues' ? styles.active : ""}`}
                            onClick={() => {
                                setActiveTab('issues');
                                setPage(1);
                            }}
                        >Issues</button>
                        <div className={styles.separator}/>
                        <button 
                            className={`${styles.tab} ${activeTab === 'pullRequests' ? styles.active : ""}`}
                            onClick={() => {
                                setActiveTab('pullRequests');
                                setPage(1);
                            }}
                        >Pull Requests</button>  
                    </div>  
                )}
                {issuesPRData && (
                    <div className={styles.navPane}>
                        <div className={styles.leftNav}>
                            <div className={styles.info}>
                                {owner && repo && (
                                    <span className={styles.infoLink}>
                                        <a href={`https://github.com/${owner}/${repo}`} className={styles.link} target="_blank" rel="noreferrer">
                                            {owner}/{repo}
                                        </a>
                                    </span>
                                )}
                                {username && (
                                    <span className={styles.infoLink}>
                                        <a href={`https://github.com/${username}`} className={styles.link} target="_blank" rel="noreferrer">
                                            @{username}
                                        </a>
                                    </span>
                                )}
                            </div>
                            <div className={styles.controlWrappper}>
                                {page > 2 && (
                                    <button
                                        className={styles.navButton}
                                        onClick={() => setPage(1)}  
                                    >
                                        ◀◀
                                    </button>
                                )}
                                {page > 1 && (
                                    <button
                                        className={styles.navButton}
                                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    >
                                        ◀
                                    </button>
                                )}
                            </div>
                        </div>
                        <span className={styles.pageInfo}>{page} / {getTotalPages()}</span>
                        <div className={styles.rightNav}>
                            {page < getTotalPages() && (
                                <>
                                <button
                                    className={styles.navButton}
                                    onClick={() => setPage((prev) => Math.min(prev + 1, getTotalPages()))}
                                >
                                    ▶
                                </button>
                                <button
                                    className={styles.navButton}
                                    onClick={() => setPage(getTotalPages())}
                                >
                                    ▶▶
                                </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
                {isLoading &&(
                    <div className={styles.loader}>Загрузка...</div>
                )}
                {issuesPRData && activeTab === "issues" && !isLoading && (
                    <div className={styles.listContainer}>

                        {issuesPRData.issues.length === 0 ? (
                            <div className={styles.noData}>Нет открытых issues</div>
                        ) : (
                            issuesPRData.issues.map((issue: IssuePRData) => (
                                <IssuePR 
                                    key={issue.id} 
                                    issuePRData={issue}
                                    userOnlyMode={userOnlyMode}
                                />
                            ))
                        )}

                    </div>
                )}
                {issuesPRData && activeTab === "pullRequests" && !isLoading && (
                    <div className={styles.listContainer}>
                        {issuesPRData.pullRequests.length === 0 ? (
                            <div className={styles.noData}>Нет открытых pull requests</div>
                        ) : (
                            issuesPRData.pullRequests.map((pr: IssuePRData) => (
                                <IssuePR 
                                    key={pr.id} 
                                    issuePRData={pr}
                                    userOnlyMode={userOnlyMode} 
                                />
                            ))
                        )}
                    </div>
                )}
            </div> 
        </div>
    )
}
