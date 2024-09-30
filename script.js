// Initial unit state (Celsius)
let isCelsius = true;

// Fetch weather data from Open-Meteo API
const fetchWeatherData = async (latitude, longitude) => {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(4)}&longitude=${longitude.toFixed(4)}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

    try {
        console.log('Fetching weather data for coordinates:', { latitude, longitude });
        const response = await fetch(apiUrl);
        
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        localStorage.setItem('weatherData', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null; // Return null on error
    }
};

// Display current weather data
const displayWeatherData = (data) => {
    if (!data || !data.current_weather) {
        displayError();
        return;
    }

    const { current_weather, daily } = data;

    const temperature = isCelsius
        ? current_weather.temperature
        : convertToFahrenheit(current_weather.temperature);

    document.getElementById('temperature').textContent = `Temperature: ${temperature.toFixed(1)}°${isCelsius ? 'C' : 'F'}`;
    document.getElementById('wind-speed').textContent = `Wind Speed: ${current_weather.windspeed} km/h`;
    document.getElementById('wind-direction').textContent = `Wind Direction: ${current_weather.winddirection}°`;
    document.getElementById('location').textContent = 'Location: Based on your GPS';

    // Optional: Display daily max/min temperatures
    for (let i = 0; i < 3; i++) {
        const maxTemp = isCelsius ? daily.temperature_2m_max[i] : convertToFahrenheit(daily.temperature_2m_max[i]);
        const minTemp = isCelsius ? daily.temperature_2m_min[i] : convertToFahrenheit(daily.temperature_2m_min[i]);

        // Assuming you have HTML elements with IDs like 'day-1-temp', 'day-2-temp', etc.
        document.getElementById(`day-${i + 1}-temp`).textContent = `Max: ${maxTemp.toFixed(1)}°${isCelsius ? 'C' : 'F'}, Min: ${minTemp.toFixed(1)}°${isCelsius ? 'C' : 'F'}`;
    }
};

// Convert Celsius to Fahrenheit
const convertToFahrenheit = (tempCelsius) => (tempCelsius * 9 / 5) + 32;

// Display error message when weather data cannot be fetched
const displayError = () => {
    document.getElementById('location').textContent = 'Location: Unable to fetch data';
    document.getElementById('temperature').textContent = 'Temperature: N/A';
    document.getElementById('wind-speed').textContent = 'Wind Speed: N/A';
    document.getElementById('wind-direction').textContent = 'Wind Direction: N/A';
};

// Handle unit toggle change (Celsius/Fahrenheit)
document.getElementById('unit-toggle').addEventListener('change', (event) => {
    isCelsius = event.target.checked;
    document.getElementById('unit-label').textContent = isCelsius ? 'Celsius' : 'Fahrenheit';

    // Get cached data and update display
    const cachedData = JSON.parse(localStorage.getItem('weatherData'));
    if (cachedData) {
        displayWeatherData(cachedData);
    }
});

// Initialize the weather app by fetching geolocation and weather data
const initializeWeatherApp = () => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const data = await fetchWeatherData(latitude, longitude);

            if (data) {
                displayWeatherData(data);
            } else {
                displayError(); // Display error if data is null
            }
        }, (error) => {
            console.error('Geolocation error:', error);
            displayError();
        });
    } else {
        console.log('Geolocation is not supported by your browser.');
        displayError();
    }
};

// Start the app
initializeWeatherApp();



