window.addEventListener('load', () => {
  const fetchWeatherData = async (latitude, longitude, city = null) => {
    let apiUrl;
    if (city) {
      apiUrl = `/weather?city=${city}`;
    } else {
      apiUrl = `/weather?lat=${latitude}&lon=${longitude}`;
    }

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      localStorage.setItem('weatherData', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      const cachedData = localStorage.getItem('weatherData');
      if (cachedData) return JSON.parse(cachedData);
      throw error;
    }
  };

  const displayWeatherData = (data) => {
    const location = data.name;
    const temperature = data.main.temp;
    const description = data.weather[0].description;
    const icon = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;

    document.getElementById('location').textContent = `Location: ${location}`;
    document.getElementById('temperature').textContent = `Temperature: ${temperature}°C`;
    document.getElementById('description').textContent = `Description: ${description}`;
    document.getElementById('icon').setAttribute('src', icon);
  };

  const initializeWeatherApp = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        try {
          const data = await fetchWeatherData(latitude, longitude);
          displayWeatherData(data);
        } catch (error) {
          console.error('Could not fetch weather data from API or cache');
          displayFallbackForm();
        }
      }, (error) => {
        console.error('Error getting geolocation:', error);
        displayFallbackForm();
      });
    } else {
      console.log('Geolocation is not supported by your browser.');
      displayFallbackForm();
    }
  };

  const displayFallbackForm = () => {
    const weatherContainer = document.getElementById('weather-container');
    weatherContainer.innerHTML = `
      <h2>Enter Location Manually</h2>
      <input type="text" id="manual-location" placeholder="Enter city name">
      <button id="fetch-weather">Get Weather</button>
      <p id="error-message"></p>
    `;

    document.getElementById('fetch-weather').addEventListener('click', async () => {
      const city = document.getElementById('manual-location').value;
      if (city) {
        try {
          const data = await fetchWeatherData(null, null, city);
          displayWeatherData(data);
        } catch (error) {
          document.getElementById('error-message').textContent = 'Error fetching weather data. Please try again.';
          console.error('Error fetching weather data:', error);
        }
      }
    });
  };

  initializeWeatherApp();
});
