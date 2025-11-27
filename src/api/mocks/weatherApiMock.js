const cityDB = [
  { name: "Moscow", lat: 55.75, lon: 37.61 },
  { name: "Moscow (US)", lat: 46.73, lon: -117.00 },
  { name: "Berlin", lat: 52.52, lon: 13.40 }
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
