/**
 * Weather Display Component
 * Displays weather information for selected location and time
 */

export class WeatherDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    /**
     * Get human-readable weather condition from WMO code
     * @param {number} code - WMO weather code
     * @returns {string} Weather condition description
     */
    getWeatherCondition(code) {
        const conditions = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Depositing rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            56: 'Light freezing drizzle',
            57: 'Dense freezing drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            66: 'Light freezing rain',
            67: 'Heavy freezing rain',
            71: 'Slight snow fall',
            73: 'Moderate snow fall',
            75: 'Heavy snow fall',
            77: 'Snow grains',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            85: 'Slight snow showers',
            86: 'Heavy snow showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with slight hail',
            99: 'Thunderstorm with heavy hail'
        };
        return conditions[code] || `Unknown (${code})`;
    }

    /**
     * Format a weather data value with its unit
     * @param {*} value - The value to format
     * @param {string} unit - The unit string
     * @returns {string} Formatted value with unit
     */
    formatValue(value, unit) {
        if (value === null || value === undefined) {
            return 'N/A';
        }
        return `${value} ${unit}`;
    }

    /**
     * Get wind direction from degrees
     * @param {number} degrees - Wind direction in degrees
     * @returns {string} Cardinal direction
     */
    getWindDirection(degrees) {
        if (degrees === null || degrees === undefined) return 'N/A';
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return `${directions[index]} (${degrees}°)`;
    }

    render(weatherData) {
        const { latitude, longitude, requested_time, hourly_data, units } = weatherData;

        this.container.innerHTML = `
            <h3>Weather at Location</h3>
            <div class="weather-meta">
                <div><strong>Coordinates:</strong> ${latitude}, ${longitude}</div>
                <div><strong>Time:</strong> ${requested_time}</div>
            </div>

            <div class="weather-sections">
                <!-- Temperature Section -->
                <div class="weather-section">
                    <h4>🌡️ Temperature</h4>
                    <div class="weather-data">
                        <div class="weather-item">
                            <span class="weather-label">Temperature:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.temperature_2m, units.temperature_2m)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Feels Like:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.apparent_temperature, units.apparent_temperature)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Dew Point:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.dew_point_2m, units.dew_point_2m)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Soil Temperature (0-7cm):</span>
                            <span class="weather-value">${this.formatValue(hourly_data.soil_temperature_0_to_7cm, units.soil_temperature_0_to_7cm)}</span>
                        </div>
                    </div>
                </div>

                <!-- Conditions Section -->
                <div class="weather-section">
                    <h4>☁️ Conditions</h4>
                    <div class="weather-data">
                        <div class="weather-item">
                            <span class="weather-label">Weather:</span>
                            <span class="weather-value">${this.getWeatherCondition(hourly_data.weather_code)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Cloud Cover:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.cloud_cover, units.cloud_cover)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Low Cloud Cover:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.cloud_cover_low, units.cloud_cover_low)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Mid Cloud Cover:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.cloud_cover_mid, units.cloud_cover_mid)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">High Cloud Cover:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.cloud_cover_high, units.cloud_cover_high)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Visibility:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.visibility, units.visibility)}</span>
                        </div>
                    </div>
                </div>

                <!-- Wind Section -->
                <div class="weather-section">
                    <h4>💨 Wind</h4>
                    <div class="weather-data">
                        <div class="weather-item">
                            <span class="weather-label">Wind Speed:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.wind_speed_10m, units.wind_speed_10m)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Wind Direction:</span>
                            <span class="weather-value">${this.getWindDirection(hourly_data.wind_direction_10m)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Wind Gusts:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.wind_gusts_10m, units.wind_gusts_10m)}</span>
                        </div>
                    </div>
                </div>

                <!-- Precipitation Section -->
                <div class="weather-section">
                    <h4>🌧️ Precipitation</h4>
                    <div class="weather-data">
                        <div class="weather-item">
                            <span class="weather-label">Total Precipitation:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.precipitation, units.precipitation)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Rain:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.rain, units.rain)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Snowfall:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.snowfall, units.snowfall)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Snow Depth:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.snow_depth, units.snow_depth)}</span>
                        </div>
                    </div>
                </div>

                <!-- Pressure & Humidity Section -->
                <div class="weather-section">
                    <h4>🌀 Pressure & Humidity</h4>
                    <div class="weather-data">
                        <div class="weather-item">
                            <span class="weather-label">Relative Humidity:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.relative_humidity_2m, units.relative_humidity_2m)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Surface Pressure:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.surface_pressure, units.surface_pressure)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Sea Level Pressure:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.pressure_msl, units.pressure_msl)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Vapor Pressure Deficit:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.vapour_pressure_deficit, units.vapour_pressure_deficit)}</span>
                        </div>
                    </div>
                </div>

                <!-- Solar Radiation Section -->
                <div class="weather-section">
                    <h4>☀️ Solar Radiation</h4>
                    <div class="weather-data">
                        <div class="weather-item">
                            <span class="weather-label">Shortwave Radiation:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.shortwave_radiation, units.shortwave_radiation)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Direct Radiation:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.direct_radiation, units.direct_radiation)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Diffuse Radiation:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.diffuse_radiation, units.diffuse_radiation)}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">Direct Normal Irradiance:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.direct_normal_irradiance, units.direct_normal_irradiance)}</span>
                        </div>
                    </div>
                </div>

                <!-- Other Section -->
                <div class="weather-section">
                    <h4>📊 Other</h4>
                    <div class="weather-data">
                        <div class="weather-item">
                            <span class="weather-label">Evapotranspiration:</span>
                            <span class="weather-value">${this.formatValue(hourly_data.et0_fao_evapotranspiration, units.et0_fao_evapotranspiration)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showLoading() {
        this.container.innerHTML = `
            <div class="weather-loading">
                <div class="spinner"></div>
                <p>Loading weather data...</p>
            </div>
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

