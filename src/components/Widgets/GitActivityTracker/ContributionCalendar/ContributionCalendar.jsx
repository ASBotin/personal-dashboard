import styles from './ContributionCalendar.module.css';

export default function ContributionCalendar({ days }) {
    return (
        <div className={styles.contributionCalendar}>
            {days.map((day, index) => (
                <div 
                    key={index}
                    className={`${styles.day} ${day.empty ? styles.empty : styles[`level${day.level}`]}`}
                />
            ))}
        </div>
    )
}