import styles from "./Pomodoro.module.css";
import {useState, useRef, useEffect, useContext} from "react";
import {BoardsContext} from "../../../BoardsContext";
import ButtonPane from "../../ButtonPane/ButtonPane";
import ActionButton from "../../ButtonPane/ActionButton/ActionButton";
import CrossButton from "../../ButtonPane/CrossButton/CrossButton";
import Start from '../../../assets/controls/Start.svg?react';
import Pause from '../../../assets/controls/Pause.svg?react';
import Next from '../../../assets/controls/Next.svg?react';

export default function Pomodoro({widgetModel}) {
    const {removeWidget} = useContext(BoardsContext);

    const [timerSettings, setTimerSettings] = useState({
        work: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60
    });
    const [longBreakInterval, setLongBreakInterval] = useState({
        interval: 3,
        remain: 3
    });
    const [autoNext, setAutoNext] = useState(true);

    const [activeMode, setActiveMode] = useState("work");
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [remainingTime, setRemainingTime] = useState(timerSettings[activeMode]);

    const timerRef = useRef();

    const witchBreakIsNext = () => {
        if (longBreakInterval.remain > 0) {
            setLongBreakInterval(prev => ({
                interval: prev.interval,
                remain: prev.remain - 1
            }))
            return "shortBreak";
        }
        else {
            setLongBreakInterval(prev => ({
                interval: prev.interval,
                remain: prev.interval
            }))
            return "longBreak"
        }
    };

    const handleNextMode = () => {
        if (activeMode === "work") {
                const nextBreak = witchBreakIsNext();
                setActiveMode(nextBreak);
                setRemainingTime(timerSettings[nextBreak]);
        }
        else {
            setActiveMode("work");
            setRemainingTime(timerSettings.work);
        }
    } 

    useEffect(() => {
        if (isTimerRunning) {
            timerRef.current = setInterval(() => {
                setRemainingTime(prev => {
                    if (prev > 1) return (prev - 1);

                    if (!autoNext) {
                        setIsTimerRunning(false);
                        return 0;
                    }

                    return -1;
                })
            }, 1000)
        }
        return () => clearInterval(timerRef.current);
    }, [isTimerRunning, autoNext, activeMode]);

    useEffect(() => {
        if (remainingTime === -1) {
            handleNextMode();
        }
    })

    return (
        <div className = {styles.pomodoro}>
            <ButtonPane>
                <ActionButton
                    className = "pomodoro"
                />
                <CrossButton
                    onClick={() => removeWidget(widgetModel.id)}
                    className = "pomodoro"
                />
            </ButtonPane>
            <div className ={styles.content}>
                <div className={styles.timerContainer}>
                    <div className={styles.timer}>
                        {Math.floor(remainingTime/60)}:{(remainingTime % 60).toString().padStart(2, '0')}
                    </div>
                    
                </div>
                <div className={styles.buttons}>
                    <button 
                        className={`${isTimerRunning ? styles.pauseButton : styles.startButton}`}
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                    >
                        {isTimerRunning ? <Pause className={styles.pause}/> : <Start className={styles.start}/>}
                    </button>
                    {isTimerRunning && (
                        <button
                            className={styles.nextButton}
                            onClick={handleNextMode}
                        >
                            <Next className={styles.next}/>    
                        </button>    
                    )}
                </div>
            </div>
        </div>
    )
}