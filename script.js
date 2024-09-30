// Set initial unit state
let isCelsius = true;

// Toggle unit on switch change
document.getElementById('unit-toggle').addEventListener('change', (event) => {
    isCelsius = event.target.checked;
    document.getElementById('unit-label').textContent = isCelsius ? 'Celsius' : 'Fahrenheit';

    // Update displayed weather and forecast if available
    const cachedData = JSON.parse(localStorage.getItem('weatherData'));
    if (cachedData) {
        displayWeatherData(cachedData);
        displayForecastData(cachedData);
    }
});

// Fetch weather data from Open-Meteo API
const fetchWeatherData = async (latitude, longitude) => {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode,cloudcover,relativehumidity_2m,sunrise,sunset&timezone=auto`;

    try {
        console.log('Fetching weather data for coordinates:', { latitude, longitude });
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        localStorage.setItem('weatherData', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return JSON.parse(localStorage.getItem('weatherData')) || null; // Return cached data if available
    }
};

// Display current weather data
const displayWeatherData = (data) => {
    if (!data || !data.current_weather) {
        displayError(); // Function to handle display error
        return;
    }

    const { current_weather } = data;
    const temperature = isCelsius ? current_weather.temperature : convertToFahrenheit(current_weather.temperature);

    document.getElementById('temperature').textContent = `Temperature: ${temperature.toFixed(1)}°${isCelsius ? 'C' : 'F'}`;
    document.getElementById('wind-speed').textContent = `Wind Speed: ${current_weather.windspeed} km/h`;
    document.getElementById('wind-direction').textContent = `Wind Direction: ${current_weather.winddirection}°`;
    document.getElementById('humidity').textContent = `Humidity: ${current_weather.relativehumidity_2m || 'N/A'}%`;
    document.getElementById('location').textContent = 'Location: Based on your GPS';
    document.getElementById('weather-icon').setAttribute('src', getWeatherIcon(current_weather.weathercode)); // Example function to get weather icon
};

// Display daily forecast data
const displayForecastData = (data) => {
    const dailyData = data.daily;
    for (let i = 0; i < 3; i++) { // Display next 3 days
        const maxTemp = isCelsius ? dailyData.temperature_2m_max[i] : convertToFahrenheit(dailyData.temperature_2m_max[i]);
        const minTemp = isCelsius ? dailyData.temperature_2m_min[i] : convertToFahrenheit(dailyData.temperature_2m_min[i]);
        const weatherCode = dailyData.weathercode[i];
        const cloudCover = dailyData.cloudcover[i] || 'N/A';
        const sunriseTime = dailyData.sunrise[i] || 'N/A';
        const sunsetTime = dailyData.sunset[i] || 'N/A';

        document.getElementById(`day-${i + 1}-date`).textContent = `Day ${i + 1}`;
        document.getElementById(`day-${i + 1}-temp`).textContent = `Max: ${maxTemp.toFixed(1)}°${isCelsius ? 'C' : 'F'}, Min: ${minTemp.toFixed(1)}°${isCelsius ? 'C' : 'F'}`;
        document.getElementById(`day-${i + 1}-cloud`).textContent = `Cloud Cover: ${cloudCover}%`;
        document.getElementById(`day-${i + 1}-sunrise`).textContent = `Sunrise: ${sunriseTime}`;
        document.getElementById(`day-${i + 1}-sunset`).textContent = `Sunset: ${sunsetTime}`;
        document.getElementById(`day-${i + 1}-desc`).textContent = `Condition: ${getWeatherDescription(weatherCode)}`; // Example function to get description
    }
};

// Convert Celsius to Fahrenheit
const convertToFahrenheit = (tempCelsius) => (tempCelsius * 9 / 5) + 32;

// Initialize the weather app
const initializeWeatherApp = () => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const data = await fetchWeatherData(latitude, longitude);
            if (data) {
                displayWeatherData(data);
                displayForecastData(data);
            }
        }, (error) => {
            console.error('Error getting geolocation:', error);
            displayError(); // Function to handle display error
        });
    } else {
        console.log('Geolocation is not supported by your browser.');
    }
};

// Start the app
initializeWeatherApp();




