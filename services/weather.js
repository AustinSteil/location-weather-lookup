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

    // All available hourly parameters from Open-Meteo Archive API
    const hourlyParams = [
        // Temperature
        'temperature_2m',
        'apparent_temperature',
        'dew_point_2m',
        'soil_temperature_0_to_7cm',

        // Humidity & Pressure
        'relative_humidity_2m',
        'surface_pressure',
        'pressure_msl',

        // Wind
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',

        // Precipitation
        'precipitation',
        'rain',
        'snowfall',
        'snow_depth',

        // Cloud & Visibility
        'cloud_cover',
        'cloud_cover_low',
        'cloud_cover_mid',
        'cloud_cover_high',
        'visibility',

        // Solar & Radiation
        'shortwave_radiation',
        'direct_radiation',
        'diffuse_radiation',
        'direct_normal_irradiance',

        // Other
        'et0_fao_evapotranspiration',
        'vapour_pressure_deficit',
        'weather_code'
    ];

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${year}-${month}-${day}&end_date=${year}-${month}-${day}&hourly=${hourlyParams.join(',')}`;

    const response = await fetch(url);
    const data = await response.json();

    // Find the index for the requested hour
    const targetTime = `${hour.padStart(2, '0')}:00`;
    const idx = data.hourly.time.findIndex(t => t.includes(targetTime));

    // Validate that we found data for the requested hour
    if (idx === -1) {
        throw new Error(`No weather data available for ${hour}:00 on ${year}-${month}-${day}`);
    }

    // Extract all hourly data for the requested time
    const hourly_data = {
        time: data.hourly.time[idx]
    };

    // Dynamically add all available parameters
    hourlyParams.forEach(param => {
        if (data.hourly[param]) {
            hourly_data[param] = data.hourly[param][idx];
        }
    });

    return {
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        requested_time: `${year}-${month}-${day} ${hour}:${minute}`,
        hourly_data,
        units: {
            temperature_2m: "°C",
            apparent_temperature: "°C",
            dew_point_2m: "°C",
            soil_temperature_0_to_7cm: "°C",
            relative_humidity_2m: "%",
            surface_pressure: "hPa",
            pressure_msl: "hPa",
            wind_speed_10m: "km/h",
            wind_direction_10m: "°",
            wind_gusts_10m: "km/h",
            precipitation: "mm",
            rain: "mm",
            snowfall: "cm",
            snow_depth: "m",
            cloud_cover: "%",
            cloud_cover_low: "%",
            cloud_cover_mid: "%",
            cloud_cover_high: "%",
            visibility: "m",
            shortwave_radiation: "W/m²",
            direct_radiation: "W/m²",
            diffuse_radiation: "W/m²",
            direct_normal_irradiance: "W/m²",
            et0_fao_evapotranspiration: "mm",
            vapour_pressure_deficit: "kPa",
            weather_code: "WMO code"
        }
    };
}

