// URLs для Open-Meteo
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Карта кодов WMO для перевода кода погоды в текст
// Источник: https://open-meteo.com/en/docs
const wmoWeatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
};

export const weatherApi = {
    async searchCity(name) {
        if (!name || name.trim().length < 2) return [];

        try {
            const url = `${GEOCODING_API_URL}?name=${encodeURIComponent(name)}&count=5&language=en&format=json`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error("Geocoding fetch failed");

            const data = await response.json();

            if (!data.results) return [];


            return data.results.map(city => ({
                name: `${city.name}${city.country ? `, ${city.country}` : ''}`,
                lat: city.latitude,
                lon: city.longitude,
                country: city.country,
                admin1: city.admin1 
            }));
        } catch (error) {
            console.error("City search error:", error);
            return [];
        }
    },


    async getWeather(lat, lon) {
        try {
            const params = new URLSearchParams({
                latitude: lat,
                longitude: lon,
                current: "temperature_2m,wind_speed_10m,weather_code",
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
                description: wmoWeatherCodes[current.weather_code] || "Unknown weather"
            };

        } catch (error) {
            console.error("Get weather error:", error);
            throw error; 
        }
    }
};