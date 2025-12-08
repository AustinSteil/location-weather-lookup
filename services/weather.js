/**
 * Weather Service
 * Handles weather data fetching from Open-Meteo API
 */

/**
 * Fetch historical weather data for a specific location and time
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @returns {Promise<Object>} Weather data
 */
export async function getWeatherData(latitude, longitude, date, time) {
    const [year, month, day] = date.split('-');
    const [hour, minute] = time.split(':');

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${year}-${month}-${day}&end_date=${year}-${month}-${day}&hourly=temperature_2m,precipitation,wind_speed_10m`;

    const response = await fetch(url);
    const data = await response.json();

    // Find the index for the requested hour
    const idx = data.hourly.time.findIndex(t => t.includes(`${hour}:00`));

    return {
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        requested_time: `${year}-${month}-${day} ${hour}:${minute}`,
        hourly_data: {
            time: data.hourly.time[idx],
            temperature_2m: data.hourly.temperature_2m[idx],
            precipitation: data.hourly.precipitation[idx],
            wind_speed_10m: data.hourly.wind_speed_10m[idx]
        },
        units: {
            temperature: "°C",
            precipitation: "mm/hr",
            wind_speed: "km/h"
        }
    };
}

