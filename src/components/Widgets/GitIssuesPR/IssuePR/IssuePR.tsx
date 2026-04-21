import styles from "./IssuePR.module.css";
import { IssuePRData } from "../GitIssuesPR";
import IssueIcon from "../../../../assets/git/issue.svg?react";
import PRIcon from "../../../../assets/git/git-pull-request.svg?react";
import DraftPRIcon from "../../../../assets/git/git-pull-request-draft.svg?react";
import CommentIcon from "../../../../assets/git/comments.svg?react";


export default function IssuePR({issuePRData}: {readonly issuePRData: IssuePRData}) {
    const prepareDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'just now';

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return `${diffInDays} days ago`;

        const options: Intl.DateTimeFormatOptions = { 
            day: 'numeric', 
            month: 'short', 
            year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined 
        };
        return `on ${date.toLocaleDateString('en-US', options)}`;
    };

    return (
        <div className={styles.issuePR}>
            <div className={styles.iconContainer}>
                {'draft' in issuePRData ?
                    issuePRData.draft === true ?
                        <DraftPRIcon className={`${styles.mainIcon} ${styles.grayIcon}`}/> 
                    :
                        <PRIcon className={`${styles.mainIcon} ${styles.greenIcon}`}/>
                : 
                <IssueIcon className={`${styles.mainIcon} ${styles.greenIcon}`}/>}
            </div>
            <div className={styles.wrapper}>
                <h3 className={styles.title}>
                    <a 
                        className={styles.link}
                        href={issuePRData.html_url}
                        target="_blank" 
                        rel="noreferrer" 
                    >
                        {issuePRData.title}
                    </a>
                </h3>
                <div className={styles.details}>
                    <div className={styles.number}>#{issuePRData.number}</div>
                    <div>·</div>
                    <div className={styles.meta}>
                        {issuePRData.author_association === 'NONE' ? "" : <span className={styles.association}>{issuePRData.author_association}</span>} 
                        {<a href={issuePRData.user.html_url} target="_blank" rel="noreferrer" className={styles.link}>
                            <span> {issuePRData.user.login}</span>
                        </a>} 
                        <span>posted {prepareDate(issuePRData.created_at)}</span>
                    </div>
                    {issuePRData.comments > 0 && (
                        <>
                            <div>·</div>
                            <div className={styles.comments}><CommentIcon className={`${styles.smallIcon} ${styles.grayIcon}`}/> {issuePRData.comments}</div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}