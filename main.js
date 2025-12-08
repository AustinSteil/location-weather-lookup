/**
 * Main Application Entry Point
 * Initializes all components and coordinates data flow
 */

import { getUserLocation } from './services/geocoding.js';
import { getWeatherData } from './services/weather.js';
import { DateTimePicker } from './components/datetime-picker/datetime-picker.js';
import { AddressSearch } from './components/address-search/address-search.js';
import { WeatherDisplay } from './components/weather-display/weather-display.js';
import { DataFlow } from './components/data-flow/data-flow.js';

class App {
    constructor() {
        this.userLocation = null;
        this.selectedAddress = null;
        
        // Initialize components
        this.dateTimePicker = new DateTimePicker('dateTimeContainer');
        this.weatherDisplay = new WeatherDisplay('weather');
        this.dataFlow = new DataFlow('dataFlow');
        this.addressSearch = new AddressSearch(
            'addressContainer',
            (address) => this.handleAddressSelect(address),
            (results) => this.handleAutocompleteResults(results)
        );
        
        // Load user location on startup
        this.loadUserLocation();
    }

    async loadUserLocation() {
        try {
            this.userLocation = await getUserLocation();
            console.log(`Location detected: ${this.userLocation.latitude}, ${this.userLocation.longitude} (${this.userLocation.city}, ${this.userLocation.region})`);
            
            // Update data flow visualization
            this.dataFlow.updateIPData(this.userLocation);
            
            // Pass user location to address search for proximity sorting
            this.addressSearch.setUserLocation(this.userLocation);
        } catch (err) {
            console.error('IP geolocation error:', err);
            this.dataFlow.showIPError();
        }
    }

    handleAutocompleteResults(results) {
        // Update data flow visualization with autocomplete results
        this.dataFlow.updateAutocompleteData(results, results.length);
    }

    handleAddressSelect(address) {
        this.selectedAddress = address;

        // Update data flow visualization
        this.dataFlow.updateSelectedAddress(address);

        // Fetch and display weather
        this.fetchWeather();
    }

    async fetchWeather() {
        if (!this.selectedAddress) return;

        try {
            const { date, time } = this.dateTimePicker.getDateTime();
            
            const weatherData = await getWeatherData(
                this.selectedAddress.latitude,
                this.selectedAddress.longitude,
                date,
                time
            );

            // Display weather
            this.weatherDisplay.render(weatherData);
            
            // Update data flow visualization
            this.dataFlow.updateWeatherData(weatherData);
        } catch (err) {
            console.error('Weather error:', err);
            this.weatherDisplay.showError("Couldn't retrieve weather data. Check the console for details.");
            this.dataFlow.showWeatherError();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

