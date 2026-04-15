import styles from "./GitIssuesPR.module.css";
import { WidgetModel } from "../../../models/widgetModel";
import ButtonPane from "../../ButtonPane/ButtonPane";
import CrossButton from "../../ButtonPane/CrossButton/CrossButton";
import { useContext, useState, useEffect, use } from "react";
import { BoardsContext } from "../../../BoardsContext";
import { fetchIssuesPRData } from "../../../api/githubApi";

interface IssuePR {
    id: number;
    title: string;
    body: string;
    html_url: string;
    user: {
        html_url: string;
        login: string;
    };
    comments: number;
}


interface issuesPRData {
    issues: IssuePR[];
    issuesTotal: number;
    pullRequests: IssuePR[];
    pullRequestsTotal: number;
}


export default function GitIssuesPR({widgetModel}: {readonly widgetModel: WidgetModel}) {
    const {removeWidget} = useContext(BoardsContext);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [issuesPRData, setIssuesPRData] = useState<issuesPRData | undefined>(undefined);

    const [username, setUsername] = useState<string>("");
    const [owner, setOwner] = useState<string>("");
    const [repo, setRepo] = useState<string>("");

    const [usernameInput, setUsernameInput] = useState<string>("");
    const [ownerInput, setOwnerInput] = useState<string>("");
    const [repoInput, setRepoInput] = useState<string>("");

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!username && !(owner && repo)) {
            setIssuesPRData(undefined);
        }
        else if (username || (owner && repo)) {
            const getIssuesPR = async (silent = false) => {
                try {
                    const data : issuesPRData = await fetchIssuesPRData(username, owner, repo);
                    if (data) {
                        setIssuesPRData(data);
                    }
                }
                catch (err) {
                    console.error("Data fetch error:", err);
                }
                finally {
                    if (!silent) setIsLoading(false);
                }
            }
            getIssuesPR();
        } 
    }, [username, owner, repo]);

    const handleSumbit = () => {

    }

    return (
        <div className={`${styles.gitIssuesPR} widgetContainer`}>
            <ButtonPane>            
                <CrossButton 
                    onClick = {() => removeWidget(widgetModel.id)}
                    className="reposTracker"
                /> 
            </ButtonPane>
            <div className = {`${styles.content} widgetContent`}>
                {(!username && !(owner && repo)) && (
                    <form className={styles.formContainer} onSubmit={handleSumbit}>
                        <h3 className={styles.formTitle}>Настройка трекера</h3>
                        <div className={styles.inputGroup}>
                            <div className={styles.formSubtitleContainer}><h4 className={styles.formSubtitle}>Репозиторий</h4></div>
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
                            <div className={styles.formSubtitleContainer}><h4 className={styles.formSubtitle}>Пользователь</h4></div>
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
            </div> 
        </div>
    )
}
