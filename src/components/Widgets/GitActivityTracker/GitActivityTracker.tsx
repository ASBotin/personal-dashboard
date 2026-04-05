import styles from './GitActivityTracker.module.css';
import { useEffect, useState, useContext, useRef, FormEvent } from 'react';
import { BoardsContext } from '../../../BoardsContext';

import { fetchContributionData } from '../../../api/githubContributionApi';
import { fetchUserData } from '../../../api/githubApi';

import ButtonPane from '../../ButtonPane/ButtonPane';
import ActionButton from '../../ButtonPane/ActionButton/ActionButton';
import CrossButton from '../../ButtonPane/CrossButton/CrossButton';
import ContributionCalendar from './ContributionCalendar/ContributionCalendar';

import Gist from '../../../assets/git/gist.svg?react';  
import Followers from '../../../assets/git/followers.svg?react';
import Repos from '../../../assets/git/repos.svg?react';

import { WidgetModel } from '../../../models/widgetModel';

interface UserData {
    avatar_url: string;
    html_url: string;
    followers: number;
    public_repos: number;
    public_gists: number;
}
export interface DayData {
    date?: string;
    count?: number;
    level?: number;
    empty?: boolean;
}
interface Contribution {
    date: string;
    count: number;
    level: number;
}
interface ContributionData {
    contributions: Contribution[];
}

export default function GitActivityTracker({widgetModel}: {readonly widgetModel: WidgetModel}) {
    const [username, setUsername] = useState<string>(widgetModel.data.username || "");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [contributionData, setContributionData] = useState<ContributionData | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [viewDate, setViewDate] = useState<Date>(new Date());
    const {updateWidget, removeWidget} = useContext(BoardsContext);

    const [error, setError] = useState<null | string>(null);
    const [usernameInput, setUsernameInput] = useState<string>("");
    const fetchInterval = useRef<undefined | ReturnType<typeof setInterval>>(undefined);

    const getDaysInMonth = (date: Date) => {
        if (!contributionData) return [];

        const year = date.getFullYear();
        const month = date.getMonth();
        
        const firstDay = new Date(year, month, 1).getDay(); 
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days: DayData[] = [];
        
        for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
            days.push({ empty: true });
        }
        
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const found = contributionData.contributions.find(c => c.date === dateStr);
            days.push({
                date: dateStr,
                count: found ? found.count : 0,
                level: found ? found.level : 0
            });
        }
        return days;
    };

    const daysInMonth = getDaysInMonth(viewDate);

    useEffect(() => {
        if (username) {
            const getContributionData = async (silent = false) => {
                if (!silent) setIsLoading(true);
                try {
                    const data = await fetchContributionData(username);
                    if (data?.contributions) {
                        setContributionData(data);
                        setError(null);
                    } 
                    else {
                        setError("Пользователь не найден");
                        setUsername("");
                        setContributionData(null);
                    }
                }
                catch (err) {
                    console.error("Repos data fetch error:", err);
                }
                finally {
                    if (!silent) setIsLoading(false);
                }
            }
            const getUserData = async () => {
                try {
                    const data = await fetchUserData(username);
                    if (!data) throw new Error("Пользователь не найден");
                    setUserData(data);
                    setError(null);
                }
                catch (err) {
                    console.error("User data fetch error:", err);
                    setError("Пользователь не найден");
                    setUsername("");
                    setContributionData(null);
                }
            }
            getUserData();
            getContributionData();
            updateWidget({
                ...widgetModel,
                data: { username }
            })
            fetchInterval.current = setInterval(getContributionData, 600000, true);

            return () => clearInterval(fetchInterval.current);
        }
    }, [username])

    const handleChangeViewDate = (d: number) => {
        const newViewDate = new Date(viewDate);
        newViewDate.setMonth(newViewDate.getMonth() + d);

        const today = new Date();
        const checkMax = new Date(newViewDate.getFullYear(), newViewDate.getMonth(), 1);
        const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        if (checkMax > currentMonth) return;

        if (contributionData?.contributions) {
            const activeDays = contributionData.contributions.filter(c => c.count > 0);
            
            if (activeDays.length > 0) {
                const firstEntry = activeDays.reduce((minEntry, current) => {
                    return current.date < minEntry.date ? current : minEntry;
                });

                const firstDateStr = firstEntry.date; 
                const [y, m] = firstDateStr.split('-').map(Number);
                
                const minLimit = new Date(y, m - 1, 1);
                const checkMin = new Date(newViewDate.getFullYear(), newViewDate.getMonth(), 1);

                if (checkMin < minLimit) return;
            }
        }

        setViewDate(newViewDate);
    }
    const formattedDate = viewDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' }).replace(' г.', '') .replace(' г', '');

    const displayMonth = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    const actionsOptions = [
        { label: "Сменить пользователя", onClick: () => {setUsername("")}},
    ];

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); 
        if (usernameInput.trim()) {
            setError(null);
            setUsername(usernameInput);
        }
    };

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
        <div className={`${styles.gitActivityTracker} widgetContainer`}>
            <ButtonPane>            
                {username && (
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
                {!username && (
                    <form className={styles.formContainer} onSubmit={handleSubmit}> 
                        <h4 className={styles.formTitle}>Настройка трекера</h4>                        
                        <div className={styles.inputGroup}>
                            <input 
                                type="text" 
                                placeholder="Имя пользователя" 
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                className={styles.usernameInput}
                                required
                            />
                            {error && <div className={styles.errorMessage}>{error}</div>}
                        </div>
                        <button 
                            type="submit" 
                            className={styles.submitBtn}
                            disabled={!usernameInput}
                        >
                            Получить данные
                        </button>
                    </form>
                )}
                {username && isLoading && (
                    <div className={styles.loader}>
                        Загрузка...
                    </div>
                )}
                {username && !isLoading && contributionData && (
                    <>
                    {userData && (
                        <div className={styles.userDataContainer}>
                            <div className={styles.avatarContainer}>
                                <img 
                                    src={userData.avatar_url} 
                                    className={styles.avatar} 
                                    alt="avatar" 
                                />
                            </div>
                            <div className={styles.userInfo}>
                                <h2 className={styles.username}>
                                    <a 
                                        href={userData?.html_url || `https://github.com/${username}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className={styles.userLink}
                                    >
                                        {username}
                                    </a>   
                                </h2>
                                <div className={styles.userStats}>
                                    <div className={styles.statItem} title='followers'>
                                        <Followers className={styles.statsIcon}/>
                                        {prepareNumber(userData.followers)}
                                    </div>
                                    <div className={styles.statItem} title='public repositories'>
                                        <Repos className={styles.statsIcon}/>
                                        {prepareNumber(userData.public_repos)}
                                    </div>
                                    <div className={styles.statItem} title='public gists'>
                                        <Gist className={styles.statsIcon}/>
                                        {prepareNumber(userData.public_gists)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                        
                    <div className ={styles.container}>
                        <div className={styles.calendarControls}>
                            <button 
                                className = {styles.changeMonthButton}
                                onClick={() => handleChangeViewDate(-1)}
                            >‹</button>
                            <div className={styles.currentMonth}>
                                {displayMonth}
                            </div>  
                            <button 
                                className = {styles.changeMonthButton}
                                onClick={() => handleChangeViewDate(1)}
                            >›</button>
                        </div>
                        <ContributionCalendar
                            days = {daysInMonth}
                        />
                    </div>
                    </>
                )}
            </div>
        </div>
    )
}     

