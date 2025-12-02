import styles from './Weather.module.css';
import { weatherApi } from '../../../../api/mocks/weatherApiMock';
import { useState, useEffect } from 'react'; 

export default function Weather({ widgetModel }) {
    const { lat, lon} = widgetModel.data;
    const [weatherData, setWeatherData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (lat && lon) {
            const fetchWeather = async () => {
                setIsLoading(true);
                try {
                    const data = await weatherApi.getWeather(lat, lon);
                    setWeatherData(data);
                } catch (err) {
                    console.error("Weather fetch error:", err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchWeather();
        } else {
            setWeatherData(null);
        }
    }, [lat, lon]);

    if (!lat || !lon) {
        return (
            <div className={styles.weatherContainer}>
                <p>Please select a city to view the weather information.</p>
            </div>
        );
    }

    if (isLoading) {
        return <div className={styles.loading}>Loading weather...</div>;
    }

    if (!weatherData) {
        return null;
    }

    const { temperature, description, windspeed } = weatherData;

    return (
        <div className={styles.weatherContainer}>
            <div className={styles.temperature}>
                {Math.round(temperature)}°C
            </div>
            <div className={styles.details}>
                <p className={styles.description}>{description}</p>
                <p className={styles.windspeed}>Wind: {windspeed} m/s</p>
            </div>
        </div>
    );
}