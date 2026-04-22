import styles from "./Pomodoro.module.css";
import {useState, useRef, useEffect, useContext} from "react";
import {BoardsContext} from "../../../BoardsContext";
import ButtonPane from "../../ButtonPane/ButtonPane";
import ActionButton from "../../ButtonPane/ActionButton/ActionButton";
import CrossButton from "../../ButtonPane/CrossButton/CrossButton";
import Start from '../../../assets/controls/Start.svg?react';
import Pause from '../../../assets/controls/Pause.svg?react';
import Next from '../../../assets/controls/Next.svg?react';
import alertSound from '../../../assets/alert.mp3';
import { WidgetModel } from '../../../models/widgetModel';
import Modal from "../../../layout/Modal/Modal";

type PomodoroMode = "work" | "shortBreak" | "longBreak";

export default function Pomodoro({widgetModel}: { readonly widgetModel: WidgetModel }) {
    const {removeWidget, updateWidget} = useContext(BoardsContext);
    
    const [longBreakInterval, setLongBreakInterval] = useState({
        interval: widgetModel.data.longBreakInterval || 3,
        remain: widgetModel.data.longBreakRemain || 3
    });
    const [autoNext, setAutoNext] = useState<boolean>(widgetModel.data.timerSettings?.autoNext !== undefined ? widgetModel.data.timerSettings?.autoNext : true);

    const [timerSettings, setTimerSettings] = useState({
        work: widgetModel.data.timerSettings?.work || 25 * 60,
        shortBreak: widgetModel.data.timerSettings?.shortBreak || 5 * 60,
        longBreak: widgetModel.data.timerSettings?.longBreak || 15 * 60,
        autoNext: widgetModel.data.timerSettings?.autoNext !== undefined ? widgetModel.data.timerSettings?.autoNext : autoNext
    });

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [activeMode, setActiveMode] = useState<PomodoroMode>(widgetModel.data.activeMode || "work");
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

    const timerRef = useRef<number | undefined>(undefined);

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
        let mode: PomodoroMode;
        if (activeMode === "work") {
                const nextBreak = witchBreakIsNext();
                mode = nextBreak;
        }
        else {
            mode = "work";
        }
        const isRunning = isTimerRunning;
        const finishTime = isRunning ? Date.now() + timerSettings[mode] * 1000 : null;

        setRemainingTime(timerSettings[mode]);
        setActiveMode(mode);            
        updateWidget({
            ...widgetModel,
            data: {
                ...widgetModel.data,
                activeMode: mode, 
                timerSettings: timerSettings,
                isTimerRunning: isRunning,
                finishTime: finishTime,
                savedRemainingTime: timerSettings[mode],
                longBreakInterval: longBreakInterval.interval,
                longBreakRemain: longBreakInterval.remain
            }
        });
    }
    
    const handleModeChange = (mode: PomodoroMode) => {
        setActiveMode(mode);
        setRemainingTime(timerSettings[mode]);

        const isRunning = isTimerRunning;
        const finishTime = isRunning ? Date.now() + timerSettings[mode] * 1000 : null;

        updateWidget({
            ...widgetModel,
            data: {
                ...widgetModel.data,
                activeMode: mode,
                timerSettings: timerSettings,
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
                    timerSettings: timerSettings,
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
                    timerSettings: timerSettings,
                    isTimerRunning: false,
                    finishTime: null,
                    savedRemainingTime: remainingTime,
                    activeMode
                }
            })
            localStorage.removeItem('active_timer');    
        }
        setIsTimerRunning(newRunningState);
    }

    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
        const saved = widgetModel;
        if (saved.data.isTimerRunning && saved.data.finishTime) {
            const now = Date.now();
            const diff = Math.round((saved.data.finishTime - now) / 1000);

            if (diff > 0) {
                setActiveMode(saved.data.activeMode || "work");
                setRemainingTime(diff);
                setIsTimerRunning(true);
            } else {
                setRemainingTime(0);
                setIsTimerRunning(false);
            }
        } else if (saved.data.savedRemainingTime) {
            setRemainingTime(saved.data.savedRemainingTime);
        }
    }, []);

    const notify = (title: string, message: string) => {
        const audio = new Audio(alertSound);
        audio.play().catch(e => console.error("Ошибка воспроизведения звука:", e));
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
        if (isTimerRunning && widgetModel.data.finishTime) {
            timerRef.current = setInterval(() => {
                setRemainingTime((prev: number) => {
                    const now = Date.now();
                    const diff = Math.round((widgetModel.data.finishTime - now) / 1000);
                    if (prev > 1) return diff;

                    if (!autoNext) {
                        setIsTimerRunning(false);
                        return 0;
                    }

                    return -1;
                })
            }, 1000)
        }
        return () => clearInterval(timerRef.current);
    }, [isTimerRunning, autoNext, activeMode, widgetModel.data.finishTime]);

    const actionsOptions = [
        {
            label: "Настройки",
            onClick: () => {setIsSettingsOpen(true)},
        },
    ];

    return (
        <div className = {`${styles.pomodoro} widgetContainer`}>
            <ButtonPane>
                <ActionButton
                    options={actionsOptions}
                    className = "pomodoro"
                />
                <CrossButton
                    onClick={() => removeWidget(widgetModel.id)}
                    className = "pomodoro"
                />
            </ButtonPane>
            <div className = {`${styles.content} widgetContent`}>
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
            <Modal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                title="Настройки Pomodoro"
            >
                <div className={styles.settingsForm}>
                    <div className={styles.settingItem}>
                        <label>Рабочее время (мин)</label>
                        <input 
                            type="number" 
                            value={timerSettings.work / 60} 
                            onChange={(e) => setTimerSettings({...timerSettings, work: Number(e.target.value) * 60})}
                        />
                    </div>
                    <div className={styles.settingItem}>
                        <label>Короткий перерыв (мин)</label>
                        <input 
                            type="number" 
                            value={timerSettings.shortBreak / 60} 
                            onChange={(e) => setTimerSettings({...timerSettings, shortBreak: Number(e.target.value) * 60})}
                        />
                    </div>
                    <div className={styles.settingItem}>
                        <label>Длинный перерыв (мин)</label>
                        <input 
                            type="number" 
                            value={timerSettings.longBreak / 60} 
                            onChange={(e) => setTimerSettings({...timerSettings, longBreak: Number(e.target.value) * 60})}
                        />
                    </div>
                    <div className={styles.settingItemRow}>
                        <label>Автоматический переход</label>
                        <input 
                            type="checkbox" 
                            checked={timerSettings.autoNext} 
                            onChange={(e) => {
                                setTimerSettings({...timerSettings, autoNext: e.target.checked});
                                setAutoNext(e.target.checked);
                            }}
                        />
                    </div>
                    
                    <button 
                        className={styles.saveButton}
                        onClick={() => {
                            updateWidget({
                                ...widgetModel,
                                data: {
                                    ...widgetModel.data,
                                    timerSettings: timerSettings
                                }
                            });
                            if (!isTimerRunning) {
                                setRemainingTime(timerSettings[activeMode]);
                            }
                            setIsSettingsOpen(false);
                        }}
                    >
                        Сохранить настройки
                    </button>
                </div>
            </Modal>
        </div>
    )
}