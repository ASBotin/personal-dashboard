import styles from './ButtonPane.module.css';
import { ReactNode } from 'react';

interface ButtonPaneProps {
    children: ReactNode;
}

export default function ButtonPane({ children }: ButtonPaneProps) {

    const handleStopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
    };
    

    return (
        <div className="widget-drag-handle" >
            <div 
                className = {`${styles.buttonPane}`}
                onMouseDown={handleStopPropagation}
                onTouchStart={handleStopPropagation}
            >
                { children }
            </div>
        </div>
    )
}