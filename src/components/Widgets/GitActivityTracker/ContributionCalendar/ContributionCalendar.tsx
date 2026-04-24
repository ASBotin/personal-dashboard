import styles from './ContributionCalendar.module.css';
import { useState } from 'react';
import { DayData } from '../GitActivityTracker';

interface TooltipData {
    display: boolean;
    date: string | undefined;
    commits: number | undefined;
    level?: number | string;
    x: number;
    y: number;
}

export default function ContributionCalendar({ days }: { readonly days: DayData[] }) {
    const [tooltip, setTooltip] = useState<TooltipData>({
        display: false,
        date: undefined,
        commits: undefined,
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
                    role="gridcell"
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                        if (day.empty) return;

                        const rect = e.currentTarget.getBoundingClientRect();
                        const parent = e.currentTarget.parentElement;

                        if (parent) {
                            const containerRect = parent.getBoundingClientRect();

                            setTooltip({
                                display: true,
                                date: day.date ?? "",
                                commits: day.count ?? 0,
                                level: day.level,
                                x: rect.left - containerRect.left + rect.width / 2,
                                y: rect.top - containerRect.top - 30,
                            });
                        }
                    }}
                    onMouseLeave={() => {
                        setTooltip({
                            display: false,
                            date: undefined,
                            commits: undefined,
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
