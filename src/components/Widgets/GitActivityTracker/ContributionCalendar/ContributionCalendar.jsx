import styles from './ContributionCalendar.module.css';
import { useState } from 'react';

export default function ContributionCalendar({ days }) {
    const [tooltip, setTooltip] = useState({
        display: false,
        date: "",
        commits: "",
        x: 0,
        y: 0,
    })

    return (
        <div className={styles.contributionCalendar}>
            {tooltip.display && (
                <div className={styles.tooltip} style={{ left: tooltip.x, top: tooltip.y }}>
                    <div>{tooltip.date}</div>
                    <div>Commits: {tooltip.commits}</div>
                    <div>Level: {tooltip.level}</div>
                </div>
            )}
            {days.map((day, index) => (
                <div 
                    key={index}
                    className={`${styles.day} ${day.empty ? styles.empty : styles[`level${day.level}`]}`}
                    onMouseEnter={(e)=>{
                        if (day.empty) return;
                        const rect = e.target.getBoundingClientRect();
                        const containerRect = e.currentTarget.parentElement.getBoundingClientRect();

                        setTooltip({
                            display: true,
                            date: day.date,
                            commits: day.count,
                            level: day.level,
                            x: rect.left - containerRect.left + rect.width / 2,
                            y: rect.top - containerRect.top - 30, 
                        });
                    }}
                    onMouseLeave={() => {
                        setTooltip({
                            display: false,
                            date: "",
                            commits: "",
                            level: "",
                            x: 0,
                            y: 0,
                        })
                    }}
                />
            ))}
        </div>
    )
}