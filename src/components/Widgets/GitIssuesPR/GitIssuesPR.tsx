import styles from "./GitIssuesPR.module.css";
import { WidgetModel } from "../../../models/widgetModel";
import ButtonPane from "../../ButtonPane/ButtonPane";
import CrossButton from "../../ButtonPane/CrossButton/CrossButton";
import ActionButton from "../../ButtonPane/ActionButton/ActionButton";
import { useContext, useState, useEffect, FormEvent } from "react";
import { BoardsContext } from "../../../BoardsContext";
import { fetchIssuesPRData } from "../../../api/githubApi";
import IssuePR from "./IssuePR/IssuePR";

import Question from "../../../assets/git/question.svg?react";

export interface Issue {
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
}

export interface PR {
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
    draft: boolean;
}

interface IssuesPRData {
    issues: Issue[];
    issuesTotal: number;
    pullRequests: PR[];
    pullRequestsTotal: number;
}

export default function GitIssuesPR({widgetModel}: {readonly widgetModel: WidgetModel}) {
    const {removeWidget} = useContext(BoardsContext);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [issuesPRData, setIssuesPRData] = useState<IssuesPRData | undefined>(undefined);

    const [username, setUsername] = useState<string>("");
    const [owner, setOwner] = useState<string>("");
    const [repo, setRepo] = useState<string>("");

    const [usernameInput, setUsernameInput] = useState<string>("");
    const [ownerInput, setOwnerInput] = useState<string>("");
    const [repoInput, setRepoInput] = useState<string>("");

    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<"issues" | "pullRequests">("issues");

    useEffect(() => {
        if (!username && !(owner && repo)) {
            setIssuesPRData(undefined);
        }
        else if (username || (owner && repo)) {
            const getIssuesPR = async (silent = false) => {
                setIsLoading(true);
                try {
                    const data : IssuesPRData = await fetchIssuesPRData(username, owner, repo);
                    if (data) {
                        setIssuesPRData(data);
                        console.log("Fetched data:", data);
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
        } 
    }, [username, owner, repo]);

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
        { label: "Сменить пользователя", onClick: () => {
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
                {isLoading && (
                    <div className={styles.loader}>Загрузка...</div>
                )}
                {issuesPRData && (
                    <div className={styles.tabs}>
                        <button 
                            className={`${styles.tab} ${activeTab === 'issues' ? styles.active : ""}`}
                            onClick={() => setActiveTab('issues')}
                        >Issues</button>
                        <div className={styles.separator}/>
                        <button 
                            className={`${styles.tab} ${activeTab === 'pullRequests' ? styles.active : ""}`}
                            onClick={() => setActiveTab('pullRequests')}
                        >Pull Requests</button>  
                    </div>  
                )}
                {issuesPRData && activeTab === "issues" && (
                    <div className={styles.listContainer}>
                        {issuesPRData.issues.length === 0 ? (
                            <div className={styles.noData}>Нет открытых issues</div>
                        ) : (
                            issuesPRData.issues.map((issue: Issue) => (
                                <IssuePR key={issue.id} issuePRData={issue} />
                            ))
                        )}

                    </div>
                )}
                {issuesPRData && activeTab === "pullRequests" && (
                    <div className={styles.listContainer}>
                        {issuesPRData.pullRequests.length === 0 ? (
                            <div className={styles.noData}>Нет открытых pull requests</div>
                        ) : (
                            issuesPRData.pullRequests.map((pr: PR) => (
                                <IssuePR key={pr.id} issuePRData={pr} />
                            ))
                        )}
                    </div>
                )}
            </div> 
        </div>
    )
}
