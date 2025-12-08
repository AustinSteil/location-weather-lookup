# Location Weather Lookup

A vanilla JavaScript application for looking up historical weather data at specific addresses and times.

## Project Structure

```text
location-weather-modal/
├── index.html              # Main HTML entry point
├── main.js                 # Application initialization and coordination
├── main.css                # Global styles and component imports
├── services/               # API service modules
│   ├── geocoding.js        # IP geolocation & Nominatim address search
│   └── weather.js          # Open-Meteo weather API
└── components/             # UI components (self-contained)
    ├── datetime-picker/
    │   ├── datetime-picker.js
    │   └── datetime-picker.css
    ├── address-search/
    │   ├── address-search.js
    │   └── address-search.css
    ├── weather-display/
    │   ├── weather-display.js
    │   └── weather-display.css
    └── data-flow/
        ├── data-flow.js
        └── data-flow.css
```

## Architecture

### Services Layer

- **geocoding.js**: Handles IP-based geolocation and address autocomplete via OpenStreetMap Nominatim API
- **weather.js**: Fetches historical weather data from Open-Meteo Archive API

### Components Layer

Each component is self-contained with its own rendering logic and styles:

- **DateTimePicker**: Date and time input selection
- **AddressSearch**: Address autocomplete with debouncing and proximity sorting
- **WeatherDisplay**: Weather information display
- **DataFlow**: API data flow visualization for debugging

### Main Application

- **main.js**: Initializes components, coordinates data flow, and handles application state
- **main.css**: Global styles and component style imports
- **index.html**: Minimal HTML structure with component containers

## Features

- IP-based geolocation to prioritize nearby addresses
- Smart address search with abbreviation expansion
- Debounced autocomplete with loading indicators
- Historical weather data lookup
- Real-time data flow visualization
- US addresses only (configurable)
- Included an overly built out .gitignore file for your convenience

## Usage

Simply open `index.html` in a modern web browser. No build step required.

The application uses ES6 modules, so it must be served via HTTP (not file://).
You can use any local server, for example:

```bash
# Python 3
python -m http.server 8000

# Node.js (with http-server)
npx http-server
```

Then navigate to `http://localhost:8000`

## APIs Used

- **IP Geolocation**: <https://ipapi.co/json/>
- **Address Search**: OpenStreetMap Nominatim
- **Weather Data**: Open-Meteo Archive API
