import styles from './ButtonPane.module.css';

export default function ButtonPane({ children }) {
    return (
        <div className = {styles.buttonPane}>{ children }</div>
    )
}