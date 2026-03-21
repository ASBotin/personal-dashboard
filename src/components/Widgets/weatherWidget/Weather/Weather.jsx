import styles from './Weather.module.css';
import { weatherApi } from '../../../../api/weatherApi';
import { useState, useEffect, useRef } from 'react'; 
import { weatherIcons } from './weatherIcons'

export default function Weather({ widgetModel }) {
    const { lat, lon } = widgetModel.data;
    const [weatherData, setWeatherData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fetchInterval = useRef(null);
    const timezone = widgetModel.data.timezone;

    useEffect(() => {
        if (lat && lon) {
            const fetchWeather = async (silent = false) => {
                if (!silent) setIsLoading(true);
                try {
                    const data = await weatherApi.getWeather(lat, lon);
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
                <p className={styles.description}>Please select a city to view the weather information.</p>
            </div>
        );
    }

    if (isLoading) {
        return <div className={styles.loading}>Loading weather...</div>;
    }

    if (!weatherData) {
        return null;
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

