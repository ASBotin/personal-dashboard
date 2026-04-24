const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

const wmoWeatherCodes = {
    0: "Ясно",
    1: "Почти ясно",
    2: "Частичная облачность",
    3: "Пасмурно",
    45: "Туман",
    48: "Туман с инеем",
    51: "Легкая морось",
    53: "Морось",
    55: "Сильная морось",
    56: "Легкий дождь со снегом",
    57: "Сильный дождь со снегом",
    61: "Легкий дождь",
    63: "Дождь",
    65: "Сильный дождь",
    66: "Легкий дождь со снегом",
    67: "Сильный дождь со снегом",
    71: "Легкий снегопад",
    73: "Снегопад",
    75: "Сильный снегопад",
    77: "Снежные зерна",
    80: "Легкие ливни",
    81: "Ливни",
    82: "Сильные ливни",
    85: "Легкий снегопад",
    86: "Сильный снегопад",
    95: "Гроза",
    96: "Гроза с градом",
    99: "Гроза с сильным градом"
};

export const weatherApi = {
    async searchCity(name: string) {
        if (!name || name.trim().length < 2) return [];

        try {
            const url = `${GEOCODING_API_URL}?name=${encodeURIComponent(name)}&count=5&language=ru&format=json`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error("Geocoding fetch failed");

            const data = await response.json();

            if (!data.results) return [];

            interface GeoCityResponse {
                name: string;
                latitude: number;
                longitude: number;
                country?: string;
                admin1?: string;
                timezone?: string;
            }
            return data.results.map((city: GeoCityResponse) => ({
                name: `${city.name}${city.country ? `, ${city.country}` : ''}`,
                lat: city.latitude,
                lon: city.longitude,
                country: city.country,
                admin1: city.admin1,
                timezone: city.timezone 
            }));
        } catch (error) {
            console.error("City search error:", error);
            return [];
        }
    },


    async getWeather(lat: string, lon: string) {
        try {
            const params = new URLSearchParams({
                latitude: lat,
                longitude: lon,
                current: "temperature_2m,wind_speed_10m,weather_code,relative_humidity_2m",
                wind_speed_unit: "ms" 
            });

            const response = await fetch(`${WEATHER_API_URL}?${params.toString()}`);

            if (!response.ok) throw new Error("Weather fetch failed");

            const data = await response.json();
            const current = data.current;

            return {
                temperature: current.temperature_2m,
                windspeed: current.wind_speed_10m,
                code: current.weather_code,
                description: wmoWeatherCodes[current.weather_code as keyof typeof wmoWeatherCodes] || "Unknown weather",
                humidity: current.relative_humidity_2m
            };

        } catch (error) {
            console.error("Get weather error:", error);
            throw error; 
        }
    },

    async getWeeklyWeather(lat: string, lon: string) {
        try {
            const params = new URLSearchParams({
                latitude: lat,
                longitude: lon,
                daily: "weather_code,temperature_2m_max,temperature_2m_min",
                timezone: "auto",
                wind_speed_unit: "ms"
            });

            const response = await fetch(`${WEATHER_API_URL}?${params.toString()}`);
            if (!response.ok) throw new Error("Weekly weather fetch failed");

            const data = await response.json();
            
            return data.daily.time.map((date: string, index: number) => ({
                date,
                maxTemp: data.daily.temperature_2m_max[index],
                minTemp: data.daily.temperature_2m_min[index],
                code: data.daily.weather_code[index],
                description: wmoWeatherCodes[data.daily.weather_code[index] as keyof typeof wmoWeatherCodes] || "Unknown",
            }));

        } catch (error) {
            console.error("Get weekly weather error:", error);
            throw error;
        }
    }
};

