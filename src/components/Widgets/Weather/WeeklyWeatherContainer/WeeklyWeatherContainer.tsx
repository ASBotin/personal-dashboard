import styles from "./WeeklyWeatherContainer.module.css";
import { WidgetModel } from "../../../../models/widgetModel";
import { useState, useEffect } from "react";
import { weatherApi } from "../../../../api/weatherApi";
import { weatherIcons } from "../weatherIcons";

interface DayForecast {
    date: string;
    maxTemp: number;
    minTemp: number;
    code: number;
    description: string;
}

export default function WeeklyWeatherContainer({ widgetModel }: { readonly widgetModel: WidgetModel }) {
    const { lat, lon } = widgetModel.data;
    const [forecast, setForecast] = useState<DayForecast[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (lat && lon) {
            const fetchWeekly = async () => {
                setIsLoading(true);
                try {
                    const data = await weatherApi.getWeeklyWeather(lat, lon);
                    setForecast(data);
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchWeekly();
        }
    }, [lat, lon]);

    const getDayName = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', { weekday: 'short' });
    };

    const getWeatherIcon = (code: number) => {
        const iconObj = weatherIcons.find(i => i.codes.includes(code));
        return iconObj?.day || iconObj?.icon; // Берем дневную иконку или дефолт
    };

    if (isLoading) return <div className={styles.loader}>...</div>;
    if (!forecast) return null;

    return (
        <div className={styles.weatherContainer}>
            {forecast.map((day) => {
                const Icon = getWeatherIcon(day.code);
                return (
                    <div key={day.date} className={styles.day}>
                        <span className={styles.dayName}>{getDayName(day.date)}</span>
                        <div className={styles.iconWrapper}>
                            {Icon && <Icon className={styles.miniIcon} />}
                        </div>
                        <div className={styles.temps}>
                            <span className={styles.maxTemp}>{Math.round(day.maxTemp)}°</span>
                            <span className={styles.minTemp}>{Math.round(day.minTemp)}°</span>
                        </div>
                    </div>
                );
            })}
        </div>
    )
} 