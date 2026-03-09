import styles from './GitActivityTracker.module.css';
import { useEffect, useState, useContext } from 'react';
import { BoardsContext } from '../../../BoardsContext';

import { fetchContributionData } from '../../../api/githubContributionApi';
import { fetchUserData } from '../../../api/githubApi';

import ButtonPane from '../../ButtonPane/ButtonPane';
import ActionButton from '../../ButtonPane/ActionButton/ActionButton';
import CrossButton from '../../ButtonPane/CrossButton/CrossButton';
import ContributionCalendar from './contributionCalendar/contributionCalendar';

export default function GitActivityTracker({widgetModel}) {
    const [username, setUsername] = useState(widgetModel.data.username || "");
    const [isLoading, setIsLoading] = useState(false);
    const [contributionData, setContributionData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [viewDate, setViewDate] = useState(new Date());
    const {updateWidget, removeWidget} = useContext(BoardsContext);

    const [error, setError] = useState(null);
    const [usernameInput, setUsernameInput] = useState("");

    const getDaysInMonth = (date) => {
        if (!contributionData) return [];

        const year = date.getFullYear();
        const month = date.getMonth();
        
        const firstDay = new Date(year, month, 1).getDay(); 
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        
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
                        setUsername(null);
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
                    console.log(data)
                    setError(null);
                }
                catch (err) {
                    console.error("User data fetch error:", err);
                    setError("Пользователь не найден");
                    setUsername(null);
                    setContributionData(null);
                }
            }
            getUserData();
            
            getContributionData();
            updateWidget({
                ...widgetModel,
                data: { username }
            })
        }
    }, [username])

    const handleChangeViewDate = (d) => {
        const newViewDate = new Date(viewDate);
        newViewDate.setMonth(newViewDate.getMonth() + d);

        const today = new Date();
        const checkMax = new Date(newViewDate.getFullYear(), newViewDate.getMonth(), 1);
        const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        if (checkMax > currentMonth) return;

        if (contributionData?.contributions) {
            const activeDays = contributionData.contributions.filter(c => c.count > 0);
            if (activeDays.length > 0) {
                const firstDateStr = activeDays.reduce((min, c) => (c.date < min ? c.date : min), activeDays[0].date);
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

    const handleSubmit = (e) => {
        e.preventDefault(); 
        if (usernameInput.trim()) {
            setError(null);
            setUsername(usernameInput);
        }
    };

    return (
        <div className={styles.gitActivityTracker}>
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
            <div className = {styles.content}>
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
                                    <div>Public repos: {userData.public_repos}</div>
                                    <div>Followers: {userData.followers}</div>
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

