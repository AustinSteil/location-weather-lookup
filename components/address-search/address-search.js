/**
 * Address Search Component
 * Handles address autocomplete with debouncing and search status
 */

import { searchAddresses } from '../../services/geocoding.js';

export class AddressSearch {
    constructor(containerId, onAddressSelect, onAutocompleteResults) {
        this.container = document.getElementById(containerId);
        this.onAddressSelect = onAddressSelect;
        this.onAutocompleteResults = onAutocompleteResults;
        this.userLocation = null;
        this.searchTimeout = null;
        this.currentSearchRequest = null;
        this.isLocationSelected = false;

        this.input = null;
        this.statusIcon = null;
        this.suggestionsList = null;

        this.render();
        this.attachEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <label for="address">Enter address:</label>
            <div class="input-wrapper">
                <input type="text" id="address" placeholder="Start typing an address...">
                <span id="searchStatus" class="search-status"></span>
            </div>
            <ul id="suggestions"></ul>
        `;

        this.input = document.getElementById('address');
        this.statusIcon = document.getElementById('searchStatus');
        this.suggestionsList = document.getElementById('suggestions');
    }

    setUserLocation(location) {
        this.userLocation = location;
    }

    attachEventListeners() {
        this.input.addEventListener('input', (e) => this.handleInput(e));
    }

    async handleInput(e) {
        const val = e.target.value.trim();

        // Clear any pending search timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }

        // Abort any pending search request
        if (this.currentSearchRequest) {
            this.currentSearchRequest.abort();
            this.currentSearchRequest = null;
        }

        // Reset location selected flag when user types
        this.isLocationSelected = false;

        // Hide status icon when input is too short
        if (val.length < 3) {
            this.suggestionsList.innerHTML = '';
            this.statusIcon.className = 'search-status';
            return;
        }

        // Show loading spinner
        this.statusIcon.className = 'search-status loading';

        // Debounce the search - wait 300ms after user stops typing
        this.searchTimeout = setTimeout(async () => {
            try {
                // Create an AbortController for this request
                this.currentSearchRequest = new AbortController();

                const results = await searchAddresses(
                    val,
                    this.userLocation,
                    this.currentSearchRequest.signal
                );

                // Don't update UI if user has already selected a location
                if (this.isLocationSelected) {
                    this.statusIcon.className = 'search-status';
                    return;
                }

                this.displayResults(results);

                // Notify parent component about autocomplete results
                if (this.onAutocompleteResults) {
                    this.onAutocompleteResults(results);
                }

                this.currentSearchRequest = null;

            } catch (err) {
                // Ignore abort errors
                if (err.name === 'AbortError') {
                    this.statusIcon.className = 'search-status';
                    return;
                }
                console.error('Autocomplete error:', err);
                this.statusIcon.className = 'search-status';
                this.currentSearchRequest = null;
            }
        }, 300);
    }

    displayResults(results) {
        this.suggestionsList.innerHTML = '';

        if (results.length === 0) {
            const li = document.createElement('li');
            li.style.color = '#666';
            li.style.fontStyle = 'italic';
            li.style.cursor = 'default';
            li.textContent = 'No valid addresses found. Only US addresses are supported.';
            this.suggestionsList.appendChild(li);
            this.statusIcon.className = 'search-status';
            return;
        }

        // Show success checkmark
        this.statusIcon.className = 'search-status success';

        // Hide checkmark after 2 seconds
        setTimeout(() => {
            if (this.statusIcon.className === 'search-status success') {
                this.statusIcon.className = 'search-status';
            }
        }, 2000);

        // Display top 10 results
        results.slice(0, 10).forEach(place => {
            const li = document.createElement('li');
            const cleanAddress = this.buildCleanAddress(place.address);
            li.textContent = cleanAddress || place.display_name;

            li.onclick = () => this.selectAddress(place, cleanAddress);
            this.suggestionsList.appendChild(li);
        });
    }

    buildCleanAddress(addr) {
        if (!addr) return '';

        const parts = [];
        if (addr.house_number) parts.push(addr.house_number);
        if (addr.road) parts.push(addr.road);
        if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
        if (addr.state) parts.push(addr.state);
        if (addr.postcode) parts.push(addr.postcode);
        if (addr.country) parts.push(addr.country);

        return parts.join(', ');
    }

    selectAddress(place, cleanAddress) {
        // Mark that user has selected a location
        this.isLocationSelected = true;

        // Abort any pending requests
        if (this.currentSearchRequest) {
            this.currentSearchRequest.abort();
            this.currentSearchRequest = null;
        }

        this.input.value = cleanAddress || place.display_name;
        this.suggestionsList.innerHTML = '';
        this.statusIcon.className = 'search-status';

        // Trigger callback with selected address
        if (this.onAddressSelect) {
            this.onAddressSelect({
                latitude: parseFloat(place.lat),
                longitude: parseFloat(place.lon),
                display_name: place.display_name,
                address: place.address,
                type: place.type
            });
        }
    }
}

