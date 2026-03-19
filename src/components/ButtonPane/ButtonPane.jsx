import styles from './ButtonPane.module.css';

export default function ButtonPane({ children }) {

    const stopPropagation = (e) => e.stopPropagation();

    return (
        <div className="widget-drag-handle" >
            <div 
                className = {`${styles.buttonPane}`}
                onMouseDown={stopPropagation}
                onTouchStart={stopPropagation}
            >
                { children }
            </div>
        </div>
    )
}