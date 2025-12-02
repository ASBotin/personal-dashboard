const cityDB = [
    { name: "Moscow", lat: 55.7558, lon: 37.6176 },
    { name: "Moscow (US)", lat: 46.7324, lon: -117.0002 },
    { name: "Saint Petersburg", lat: 59.9311, lon: 30.3609 },
    { name: "London", lat: 51.5072, lon: -0.1276 },
    { name: "Berlin", lat: 52.52, lon: 13.405 },
    { name: "Tokyo", lat: 35.6895, lon: 139.6917 }
];

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const weatherApi = {
    async searchCity(name) {
        await delay(200)
        return cityDB.filter(city => city.name.toLowerCase().includes(name.toLowerCase())); 
    },
    async getWeather(lat, lon) {
        await delay(500)
        return {
            temperature: -4,
            windspeed: 5,
            code: 3,
            description: "Cloudy"
        };
    }
}
