/**
 * Data Flow Visualization Component
 * Shows the data flow through different API phases
 */

export class DataFlow {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.isVisible = false; // Default to hidden
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="data-flow-header">
                <h2>Data Flow</h2>
                <button id="toggleDataFlow" class="toggle-btn" aria-label="Toggle developer information">
                    <span class="toggle-text">Show Developer Info</span>
                </button>
            </div>

            <div id="dataFlowContent" class="data-flow-content hidden">
                <!-- Phase 1: IP Geolocation -->
                <div class="flow-phase">
                <div class="phase-header">
                    <span class="phase-number">1</span>
                    <div class="phase-info">
                        <h3>IP Geolocation (On Page Load)</h3>
                        <p>Approximate user location to prioritize nearby addresses</p>
                    </div>
                </div>
                <pre class="code-snippet" id="ipData"><code>Waiting for IP geolocation...</code></pre>
            </div>

            <!-- Phase 2: Address Autocomplete -->
            <div class="flow-phase">
                <div class="phase-header">
                    <span class="phase-number">2</span>
                    <div class="phase-info">
                        <h3>Address Search (User Types)</h3>
                        <p>Fetch autocomplete results from Nominatim API</p>
                    </div>
                </div>
                <pre class="code-snippet" id="autocompleteData"><code>Type an address to see autocomplete results...</code></pre>
            </div>

            <!-- Phase 3: Selected Address -->
            <div class="flow-phase">
                <div class="phase-header">
                    <span class="phase-number">3</span>
                    <div class="phase-info">
                        <h3>Selected Address (User Clicks)</h3>
                        <p>Chosen location with coordinates</p>
                    </div>
                </div>
                <pre class="code-snippet" id="selectedAddress"><code>Select an address from autocomplete...</code></pre>
            </div>

            <!-- Phase 4: Weather Data -->
            <div class="flow-phase">
                <div class="phase-header">
                    <span class="phase-number">4</span>
                    <div class="phase-info">
                        <h3>Weather Data (API Response)</h3>
                        <p>Historical weather data from Open-Meteo API</p>
                    </div>
                </div>
                <pre class="code-snippet" id="weatherData"><code>Weather data will appear after selecting an address...</code></pre>
            </div>
            </div>
        `;
    }

    attachEventListeners() {
        const toggleBtn = document.getElementById('toggleDataFlow');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleVisibility());
        }
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        const content = document.getElementById('dataFlowContent');
        const toggleBtn = document.getElementById('toggleDataFlow');
        const toggleText = toggleBtn.querySelector('.toggle-text');

        if (this.isVisible) {
            content.classList.remove('hidden');
            toggleText.textContent = 'Hide Developer Info';
        } else {
            content.classList.add('hidden');
            toggleText.textContent = 'Show Developer Info';
        }
    }

    formatJSON(obj, maxResults = null) {
        let data = obj;
        if (maxResults && Array.isArray(obj)) {
            data = obj.slice(0, maxResults);
            if (obj.length > maxResults) {
                data = [...data, `... and ${obj.length - maxResults} more results`];
            }
        }
        return JSON.stringify(data, null, 2);
    }

    updateIPData(ipData) {
        const element = document.getElementById('ipData');
        if (element) {
            element.innerHTML = `<code>${this.formatJSON(ipData)}</code>`;
        }
    }

    updateAutocompleteData(results, totalResults) {
        const element = document.getElementById('autocompleteData');
        if (element) {
            const displayData = results.slice(0, 3).map(place => ({
                display_name: place.display_name,
                lat: place.lat,
                lon: place.lon,
                address: place.address,
                type: place.type
            }));
            element.innerHTML = `<code>${this.formatJSON(displayData)}\n\n// Total results: ${totalResults}\n// Valid addresses: ${results.length}</code>`;
        }
    }

    updateSelectedAddress(addressData) {
        const element = document.getElementById('selectedAddress');
        if (element) {
            const selectedInfo = {
                display_name: addressData.display_name,
                latitude: addressData.latitude,
                longitude: addressData.longitude,
                address: {
                    house_number: addressData.address?.house_number,
                    road: addressData.address?.road,
                    city: addressData.address?.city || addressData.address?.town || addressData.address?.village,
                    state: addressData.address?.state,
                    postcode: addressData.address?.postcode,
                    country: addressData.address?.country
                },
                type: addressData.type
            };
            element.innerHTML = `<code>${this.formatJSON(selectedInfo)}</code>`;
        }
    }

    updateWeatherData(weatherData) {
        const element = document.getElementById('weatherData');
        if (element) {
            element.innerHTML = `<code>${this.formatJSON(weatherData)}</code>`;
        }
    }

    showIPError() {
        const element = document.getElementById('ipData');
        if (element) {
            element.innerHTML = `<code>Error loading IP geolocation</code>`;
        }
    }

    showWeatherError() {
        const element = document.getElementById('weatherData');
        if (element) {
            element.innerHTML = `<code>Error fetching weather data</code>`;
        }
    }
}

