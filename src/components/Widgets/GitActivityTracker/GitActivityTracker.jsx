import styles from './GitActivityTracker.module.css';
import { useEffect, useState, useContext } from 'react';
import { BoardsContext } from '../../../BoardsContext';

import { fetchContributionData } from '../../../api/githubContributionApi';

import ButtonPane from '../../ButtonPane/ButtonPane';
import ActionButton from '../../ButtonPane/ActionButton/ActionButton';
import CrossButton from '../../ButtonPane/CrossButton/CrossButton';
import ContributionCalendar from './contributionCalendar/contributionCalendar';

export default function GitActivityTracker({widgetModel}) {
    const [username, setUsername] = useState("ASBotin");
    const [isLoading, setIsLoading] = useState(false);
    const [contributionData, setContributionData] = useState(null);
    const [viewDate, setViewDate] = useState(new Date());
    const {removeWidget} = useContext(BoardsContext);

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
                    } 
                    else {
                        console.error("Пользователь не найден");
                    }
                }
                catch (err) {
                    console.error("Repos data fetch error:", err);
                }
                finally {
                    if (!silent) setIsLoading(false);
                }
            }
            getContributionData();
        }
    }, [username])

    return (
        <div className={styles.gitActivityTracker}>
            <ButtonPane>            
                <ActionButton
                    //options={actionsOptions}
                    className="reposTracker"
                />
                <CrossButton 
                    onClick = {() => removeWidget(widgetModel.id)}
                    className="reposTracker"
                /> 
            </ButtonPane>
            <div className = {styles.content}>
                <ContributionCalendar
                    days = {daysInMonth}
                />
            </div>
        </div>
    )
}     

