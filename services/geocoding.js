/**
 * Geocoding Service
 * Handles IP geolocation and address autocomplete via Nominatim API
 *
 * ⚠️ WARNING TO FUTURE DEVELOPERS:
 * The Nominatim API (OpenStreetMap) is a free but sub-optimal geocoding solution.
 * This code contains extensive workarounds, query manipulations, and filtering logic
 * to compensate for Nominatim's limitations in address search quality.
 *
 * RECOMMENDATION: Replace with a higher-quality API like Google Places API.
 * Benefits of using Google Places or similar premium APIs:
 * - Better address parsing and understanding of user intent
 * - More accurate results with less query manipulation needed
 * - Built-in address validation and standardization
 * - Superior autocomplete with proper ranking
 * - Less code maintenance (can remove most workarounds below)
 *
 * If you switch to Google Places, you can eliminate:
 * - The abbreviation expansion logic (buildSmartQuery function)
 * - The wildcard additions for short words
 * - The extensive result filtering logic
 * - The manual distance-based sorting
 */

// WORKAROUND: Nominatim doesn't handle common address abbreviations well.
// We manually expand them to improve search results.
// NOTE: Google Places API handles abbreviations natively - this mapping would be unnecessary.
// Address abbreviation mappings for better Nominatim queries
const directionAbbreviations = {
    'n': 'north',
    's': 'south',
    'e': 'east',
    'w': 'west',
    'ne': 'northeast',
    'nw': 'northwest',
    'se': 'southeast',
    'sw': 'southwest'
};

const streetTypeAbbreviations = {
    'st': 'street',
    'ave': 'avenue',
    'av': 'avenue',
    'blvd': 'boulevard',
    'dr': 'drive',
    'rd': 'road',
    'ln': 'lane',
    'ct': 'court',
    'cir': 'circle',
    'pl': 'place',
    'pkwy': 'parkway',
    'hwy': 'highway',
    'sq': 'square',
    'ter': 'terrace',
    'trl': 'trail',
    'way': 'way'
};

/**
 * Get user's approximate location via IP geolocation
 * @returns {Promise<Object>} Location data with lat, lng, city, region, etc.
 */
export async function getUserLocation() {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    return {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        region: data.region,
        country: data.country_name,
        postal: data.postal,
        timezone: data.timezone
    };
}

/**
 * Smart query builder that expands abbreviations and adds wildcards
 *
 * WORKAROUND FUNCTION: This entire function exists to compensate for Nominatim's poor
 * query understanding. Google Places API would handle all of this automatically.
 *
 * @param {string} input - Raw user input
 * @returns {string} Optimized search query
 */
export function buildSmartQuery(input) {
    // WORKAROUND: Normalize punctuation and whitespace because Nominatim is sensitive to formatting.
    // Google Places handles messy input gracefully without this preprocessing.
    const normalized = input
        .replace(/,/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

    const words = normalized.split(/\s+/);
    const expandedWords = [];

    words.forEach((word) => {
        if (!word) return;

        const cleanWord = word.replace(/[^\w]/g, '');
        if (!cleanWord) return;

        // Keep numbers as-is (house numbers, zip codes)
        if (/^\d+$/.test(cleanWord)) {
            expandedWords.push(cleanWord);
            return;
        }

        // WORKAROUND: Manually expand direction abbreviations (N, S, E, W, etc.)
        // Google Places understands these abbreviations natively.
        if (directionAbbreviations[cleanWord]) {
            expandedWords.push(directionAbbreviations[cleanWord]);
            return;
        }

        // WORKAROUND: Manually expand street type abbreviations (St, Ave, Blvd, etc.)
        // Google Places understands these abbreviations natively.
        if (streetTypeAbbreviations[cleanWord]) {
            expandedWords.push(streetTypeAbbreviations[cleanWord]);
            return;
        }

        // WORKAROUND: Add wildcards to short words to improve partial matching.
        // This helps Nominatim find results as users type, but can return irrelevant results.
        // Google Places has superior autocomplete that doesn't require wildcard hacks.
        if (/^[a-zA-Z]{2,4}$/.test(cleanWord)) {
            expandedWords.push(cleanWord + '*');
            return;
        }

        expandedWords.push(cleanWord);
    });

    return expandedWords.join(' ');
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in kilometers
 */
export function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

/**
 * Search for addresses using Nominatim API
 *
 * WORKAROUND FUNCTION: Contains extensive filtering and sorting logic to compensate
 * for Nominatim's poor result quality and ranking.
 *
 * @param {string} query - Search query
 * @param {Object} userLocation - User's location {latitude, longitude}
 * @param {AbortSignal} signal - AbortController signal for cancellation
 * @returns {Promise<Array>} Array of address results
 */
export async function searchAddresses(query, userLocation = null, signal = null) {
    // WORKAROUND: Use our custom query builder to manipulate the search string.
    // Google Places accepts raw user input without preprocessing.
    const searchQuery = buildSmartQuery(query);

    // WORKAROUND: Request 50 results because Nominatim returns many irrelevant results
    // that we need to filter out. Google Places returns better-ranked results, so fewer are needed.
    // WORKAROUND: Hardcode countrycodes=us to limit to US addresses since Nominatim
    // doesn't have a good way to filter by address type. Google Places has better
    // region/type filtering built-in.
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=50&addressdetails=1&countrycodes=us`;

    // WORKAROUND: Manually create a viewbox to bias results toward user's location.
    // Nominatim's location biasing is weak, so we create a geographic bounding box.
    // Google Places has superior location biasing that works more intelligently.
    if (userLocation && userLocation.latitude && userLocation.longitude) {
        const buffer = 10;
        const viewbox = `${userLocation.longitude - buffer},${userLocation.latitude + buffer},${userLocation.longitude + buffer},${userLocation.latitude - buffer}`;
        url += `&viewbox=${viewbox}&bounded=0`;
    }

    const options = signal ? { signal } : {};
    const response = await fetch(url, options);
    const data = await response.json();

    // WORKAROUND: Manually filter out non-address results (cities, states, regions, etc.)
    // Nominatim returns many irrelevant location types that aren't postal addresses.
    // Google Places has a 'types' parameter that filters to addresses automatically,
    // eliminating the need for this manual filtering logic.
    const validAddresses = data.filter(place => {
        const addr = place.address;
        if (!addr) return false;

        // Exclude administrative regions that aren't specific addresses
        const excludeTypes = ['administrative', 'state', 'country', 'city', 'county', 'region'];
        if (excludeTypes.includes(place.type)) return false;

        // Only include results with a road name or specific building/place
        const hasRoad = addr.road;
        const hasSpecificPlace = addr.building || addr.amenity || addr.shop || addr.office || addr.house_number;

        return hasRoad || hasSpecificPlace;
    });

    // WORKAROUND: Manually calculate distances and sort by proximity.
    // Nominatim's result ranking is poor and doesn't prioritize nearby results well.
    // Google Places returns results pre-sorted by relevance and proximity, making this unnecessary.
    if (userLocation && userLocation.latitude && userLocation.longitude) {
        validAddresses.forEach(place => {
            place.distance = getDistance(
                userLocation.latitude,
                userLocation.longitude,
                parseFloat(place.lat),
                parseFloat(place.lon)
            );
        });
        validAddresses.sort((a, b) => a.distance - b.distance);
    }

    return validAddresses;
}

