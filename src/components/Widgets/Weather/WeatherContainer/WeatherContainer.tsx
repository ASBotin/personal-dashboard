import styles from './WeatherContainer.module.css';
import { weatherApi } from '../../../../api/weatherApi';
import { useState, useEffect, useRef } from 'react'; 
import { weatherIcons } from './weatherIcons';
import { WidgetModel } from '../../../../models/widgetModel';

interface WeatherData {
    temperature: number;
    windspeed: number;
    code: number;
    description: string;
    humidity: number;
}

export default function Weather({ widgetModel }: { readonly widgetModel: WidgetModel }) {
    const { lat, lon } = widgetModel.data;
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const fetchInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
    const timezone = widgetModel.data.timezone;

    useEffect(() => {
        if (lat && lon) {
            const fetchWeather = async (silent = false) => {
                if (!silent) setIsLoading(true);
                try {
                    const data: WeatherData = await weatherApi.getWeather(lat, lon);
                    setWeatherData(data);
                } catch (err) {
                    console.error("Weather fetch error:", err);
                } finally {
                    if (!silent) setIsLoading(false);
                }
            };
            fetchWeather();
            fetchInterval.current = setInterval(fetchWeather, 600000, true);
            return () => clearInterval(fetchInterval.current);
        } else {
            setWeatherData(null);
        }
    }, [lat, lon]);

    if (!lat || !lon) {
        return (
            <div className={styles.weatherContainer}>
                <p className={styles.error}>Please select a city to view the weather information.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={styles.weatherContainer}>
                <div className={styles.loader}>Loading weather...</div>
            </div>
        )
    }

    if (!weatherData) {
        return (
            <div className={styles.weatherContainer}>
                <div className={styles.error}>Failed to fetch weather information from Open-meteo api. Check internet connection or turn VPN on</div>
            </div>
        )
    }

    const { temperature, description, windspeed, code, humidity } = weatherData;

    const getWeatherIcon = () => {
        const formatter = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            timeZone: timezone,
            hour12: false
        });

        const hour = Number.parseInt(formatter.format(new Date()), 10)

        const timesOfDay = (hour > 19 || hour < 5) ? 'night' : 'day';

        for (let i of weatherIcons) {
            if ((i.codes).includes(code)) {
                if (timesOfDay in i) {
                    return i[timesOfDay];
                }
                else {
                    return i.icon;
                }
            }
        }
    }

    const Icon = getWeatherIcon();

    return (
        <div className={styles.weatherContainer}>
            <div className={styles.leftSection}>
                <div className={styles.temperature}>
                    {Math.round(temperature)}°C
                </div>
                <div className={styles.details}>
                    <p className={styles.humidity}>Humidity: {humidity}%</p>
                    <p className={styles.windspeed}>Wind: {windspeed} m/s</p>
                </div>
            </div>
            <div className={styles.rightSection}>
                {Icon ? <Icon className = {styles.icon}/> : null}
                <div className={styles.description}>{description}</div>
            </div>
        </div>
    );
}

