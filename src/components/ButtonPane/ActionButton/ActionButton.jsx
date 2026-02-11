import styles from './ActionButton.module.css';
import { useState, useRef, useEffect } from 'react';

export default function ActionButton({options, color}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !(menuRef.current.contains(event.target))) {
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
                className = {styles.actionButton}
                onClick = {() => setIsMenuOpen(!isMenuOpen)}
                style={{ color }}
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