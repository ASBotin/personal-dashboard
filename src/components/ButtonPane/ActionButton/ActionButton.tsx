import styles from './ActionButton.module.css';
import { useState, useRef, useEffect } from 'react';
import { WidgetType } from '../../../models/widgetModel';

interface ActionButtonProps {
    options?: { label: string; onClick: () => void; isActive?: boolean }[];
    className?: string;
}

export default function ActionButton({options, className}: ActionButtonProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (menuRef.current && !(menuRef.current.contains(target))) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, []);

    return (
        <div ref = {menuRef} style = {{position: 'relative'}}>
            <button
                className = {`${styles.actionButton} ${className ? styles[className] : ''}`}
                onClick = {() => setIsMenuOpen(!isMenuOpen)}
            >
                ⋮
            </button>
            {isMenuOpen && (
                options && (
                    <ul className = {styles.dropdownMenu}>
                        {options.map((option, index) => (
                            <li key={index}>
                                <button
                                    className={`${styles.option} ${option.isActive ? styles.active : ''}`}
                                    onClick={() => {
                                        option.onClick();
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    {option.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                )
            )}
        </div>
    )
}