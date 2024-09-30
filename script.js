// Set initial unit state
let isCelsius = true;

// Toggle unit on switch change
document.getElementById('unit-toggle').addEventListener('change', (event) => {
    isCelsius = event.target.checked; // Update isCelsius based on toggle switch
    document.getElementById('unit-label').textContent = isCelsius ? 'Celsius' : 'Fahrenheit'; // Update label

    // Get cached data and display it
    const cachedData = JSON.parse(localStorage.getItem('weatherData'));
    if (cachedData) {
        // Update the displayed weather and forecast with the new unit
        displayWeatherData(cachedData);
        displayForecastData(cachedData);
    }
});

// Fetch weather data from Open-Meteo API
const fetchWeatherData = async (latitude, longitude) => {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode,cloudcover,relativehumidity_2m&timezone=auto`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        localStorage.setItem('weatherData', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return JSON.parse(localStorage.getItem('weatherData')) || null;
    }
};

// Display weather data
const displayWeatherData = (data) => {
    const temperature = isCelsius
        ? data.current_weather.temperature
        : convertToFahrenheit(data.current_weather.temperature);
    
    document.getElementById('temperature').textContent = `Temperature: ${temperature.toFixed(1)}°${isCelsius ? 'C' : 'F'}`;
    document.getElementById('wind-speed').textContent = `Wind Speed: ${data.current_weather.windspeed} km/h`;
    document.getElementById('wind-direction').textContent = `Wind Direction: ${data.current_weather.winddirection}°`;
    document.getElementById('humidity').textContent = `Humidity: ${data.daily.relativehumidity_2m[0] || 'N/A'}%`;
    document.getElementById('cloud-cover').textContent = `Cloud Cover: ${data.daily.cloudcover[0] || 'N/A'}%`;
    document.getElementById('location').textContent = 'Location: Based on your GPS';
    document.getElementById('weather-icon').setAttribute('src', getWeatherIcon(data.current_weather.weathercode));
};

// Display 3-day forecast
const displayForecastData = (data) => {
    const today = new Date();
    for (let i = 0; i < 3; i++) {
        const forecastDate = new Date(today);
        forecastDate.setDate(today.getDate() + i);
        const dayName = forecastDate.toLocaleDateString('en-US', { weekday: 'long' });
        
        // Convert forecast temperatures
        const forecastTempMax = isCelsius ? `${data.daily.temperature_2m_max[i]}°C` : `${convertToFahrenheit(data.daily.temperature_2m_max[i])}°F`;
        const forecastTempMin = isCelsius ? `${data.daily.temperature_2m_min[i]}°C` : `${convertToFahrenheit(data.daily.temperature_2m_min[i])}°F`;
        const weatherCode = data.daily.weathercode[i];
        
        document.getElementById(`day-${i + 1}-date`).textContent = dayName;
        document.getElementById(`day-${i + 1}-temp`).textContent = `Temperature: ${forecastTempMax} / ${forecastTempMin}`;
        document.getElementById(`day-${i + 1}-wind`).textContent = `Wind Speed: ${data.daily.windspeed_10m_max[i] || 'N/A'} km/h`;
        document.getElementById(`day-${i + 1}-humidity`).textContent = `Humidity: ${data.daily.relativehumidity_2m[i] || 'N/A'}%`;
        document.getElementById(`day-${i + 1}-desc`).textContent = `Condition: ${getWeatherDescription(weatherCode)}`;
    }
};

// Convert Celsius to Fahrenheit
const convertToFahrenheit = (tempCelsius) => (tempCelsius * 9 / 5) + 32;

// Initialize the weather app
const initializeWeatherApp = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const data = await fetchWeatherData(position.coords.latitude, position.coords.longitude);
            if (data) {
                displayWeatherData(data);
                displayForecastData(data);
            }
        }, (error) => {
            console.error('Error getting geolocation:', error);
        });
    } else {
        console.log('Geolocation is not supported by your browser.');
    }
};

// Start the app
initializeWeatherApp();
