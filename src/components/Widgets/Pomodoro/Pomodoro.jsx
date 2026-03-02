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
    const {removeWidget, updateWidget} = useContext(BoardsContext);

    const [timerSettings, setTimerSettings] = useState({
        work: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60
    });
    const [longBreakInterval, setLongBreakInterval] = useState({
        interval: widgetModel.data.longBreakInterval || 3,
        remain: widgetModel.data.longBreakRemain || 3
    });
    const [autoNext, setAutoNext] = useState(true);

    const [activeMode, setActiveMode] = useState(widgetModel.data.activeMode || "work");
    const [isTimerRunning, setIsTimerRunning] = useState(() => {
        if (widgetModel.data.isTimerRunning && widgetModel.data.finishTime) {
            return (widgetModel.data.finishTime - Date.now() > 0);
        }
        return false;
    });
    const [remainingTime, setRemainingTime] = useState(() => {
        if (widgetModel.data.isTimerRunning && widgetModel.data.finishTime) {
            const diff = Math.round((widgetModel.data.finishTime - Date.now()) / 1000);
            return Math.max(diff, 0);
        }
        return widgetModel.data.savedRemainingTime || timerSettings[activeMode];
    });

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
        let mode;
        if (activeMode === "work") {
                const nextBreak = witchBreakIsNext();
                setActiveMode(nextBreak);
                setRemainingTime(timerSettings[nextBreak]);
                mode = nextBreak;
        }
        else {
            setActiveMode("work");
            setRemainingTime(timerSettings.work);
            mode = "work";
        }
        const isRunning = isTimerRunning;
        const finishTime = isRunning ? Date.now() + timerSettings[mode] * 1000 : null;

        updateWidget({
            ...widgetModel,
            data: {
                ...widgetModel.data,
                activeMode: mode, 
                isTimerRunning: isRunning,
                finishTime: finishTime,
                savedRemainingTime: timerSettings[mode],
                longBreakInterval: longBreakInterval.interval,
                longBreakRemain: longBreakInterval.remain
            }
        });
    }
    
    const handleModeChange = (mode) => {
        setActiveMode(mode);
        setRemainingTime(timerSettings[mode]);

        const isRunning = isTimerRunning;
        const finishTime = isRunning ? Date.now() + timerSettings[mode] * 1000 : null;

        updateWidget({
            ...widgetModel,
            data: {
                ...widgetModel.data,
                activeMode: mode, 
                isTimerRunning: isRunning,
                finishTime: finishTime,
                savedRemainingTime: timerSettings[mode],
                longBreakInterval: longBreakInterval.interval,
                longBreakRemain: longBreakInterval.remain
            }
        });
    };

    const toggleTimer = () => {
        const newRunningState = (!isTimerRunning);
        if (newRunningState) {
            const finishTime = Date.now() + remainingTime * 1000;
            updateWidget({
                ...widgetModel,
                data: {
                    ...widgetModel.data,
                    isTimerRunning: true,
                    finishTime,
                    activeMode
                }
            })
        }
        else {
            updateWidget({
                ...widgetModel,
                data: {
                    ...widgetModel.data,
                    isTimerRunning: false,
                    finishTime: null,
                    savedRemainingTime: remainingTime,
                    activeMode
                }
            })
        }
        setIsTimerRunning(newRunningState);
        
    }

    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
        const saved = widgetModel;
        if (saved.isTimerRunning && saved.finishTime) {
            const now = Date.now();
            const diff = Math.round((saved.finishTime - now) / 1000);

            if (diff > 0) {
                setActiveMode(saved.activeMode || "work");
                setRemainingTime(diff);
                setIsTimerRunning(true);
            } else {
                setRemainingTime(0);
                setIsTimerRunning(false);
            }
        } else if (saved.savedRemainingTime) {
            setRemainingTime(saved.savedRemainingTime);
        }
    }, []);

    const notify = (title, message) => {
        if (Notification.permission === "granted") {
            new Notification(title, {
                body: message,
            });
        } else {
            alert(`${title}: ${message}`);
        }
    };

    useEffect(() => {
        if (remainingTime === -1) {
            const message = activeMode === "work" 
                ? "Время поработать закончилось! Пора отдохнуть." 
                : "Перерыв окончен! За работу.";
            
            notify("Pomodoro", message);
            handleNextMode();
        }
    }, [remainingTime]); 

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

    return (
        <div className = {styles.pomodoro}>
            <ButtonPane>
                <ActionButton
                    options = {[{label: "Настройки"}]}
                    className = "pomodoro"
                />
                <CrossButton
                    onClick={() => removeWidget(widgetModel.id)}
                    className = "pomodoro"
                />
            </ButtonPane>
            <div className ={styles.content}>
                <div className={styles.modeToggle}>
                    <button 
                        className={`${styles.modeButton} ${activeMode === "work" ? styles.activeMode : ""}`}
                        onClick={() => handleModeChange("work")}
                    >
                        Pomodoro
                    </button>
                    <button 
                        className={`${styles.modeButton} ${activeMode === "shortBreak" ? styles.activeMode : ""}`}
                        onClick={() => handleModeChange("shortBreak")}
                    >
                        Short Break
                    </button>
                    <button 
                        className={`${styles.modeButton} ${activeMode === "longBreak" ? styles.activeMode : ""}`}
                        onClick={() => handleModeChange("longBreak")}
                    >
                        Long Break
                    </button>
                </div>
                <div className={styles.timerContainer}>
                    <div className={styles.timer}>
                        {Math.floor(remainingTime/60).toString().padStart(2, '0')}:{(remainingTime % 60).toString().padStart(2, '0')}
                    </div>
                </div>
                <div className={styles.buttons}>
                    <button 
                        className={`${isTimerRunning ? styles.pauseButton : styles.startButton}`}
                        onClick={toggleTimer}
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