/**
 * Weather Display Component
 * Displays weather information for selected location and time
 */

export class WeatherDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render(weatherData) {
        const { latitude, longitude, requested_time, hourly_data, units } = weatherData;

        this.container.innerHTML = `
            <h3>Weather at Location</h3>
            <strong>Coordinates:</strong> ${latitude}, ${longitude}<br>
            <strong>Time:</strong> ${requested_time}<br>
            <strong>Temperature:</strong> ${hourly_data.temperature_2m}${units.temperature}<br>
            <strong>Precipitation:</strong> ${hourly_data.precipitation} ${units.precipitation}<br>
            <strong>Wind Speed:</strong> ${hourly_data.wind_speed_10m} ${units.wind_speed}
        `;
    }

    showError(message) {
        this.container.innerHTML = `
            <h3>Error</h3>
            ${message}
        `;
    }

    clear() {
        this.container.innerHTML = '';
    }
}

