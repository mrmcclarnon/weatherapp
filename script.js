window.addEventListener('load', () => {
  let apiKey;

  const fetchApiKey = async () => {
    const response = await fetch('/api-key');
    const data = await response.json();
    apiKey = data.apiKey;
    initializeWeatherApp();
  };

  const initializeWeatherApp = () => {
    const weatherContainer = document.getElementById('weather-container');
    const errorMessage = document.getElementById('error-message');
    const cityInput = document.getElementById('city-input');
    const fetchWeatherButton = document.getElementById('fetch-weather');

    const fetchWeather = (url) => {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data.cod !== 200) {
            throw new Error(data.message);
          }
          const location = data.name;
          const temperature = data.main.temp;
          const description = data.weather[0].description;
          const icon = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;

          document.getElementById('location').textContent = `Location: ${location}`;
          document.getElementById('temperature').textContent = `Temperature: ${temperature}°C`;
          document.getElementById('description').textContent = `Description: ${description}`;
          document.getElementById('icon').setAttribute('src', icon);

          localStorage.setItem('weatherData', JSON.stringify({
            location, temperature, description, icon, timestamp: new Date().getTime()
          }));
        })
        .catch(error => {
          console.error('Error fetching weather data:', error);
          errorMessage.style.display = 'block';
          errorMessage.textContent = `Error: ${error.message}`;
        });
    };

    const loadCachedWeather = () => {
      const cachedData = JSON.parse(localStorage.getItem('weatherData'));
      if (cachedData && new Date().getTime() - cachedData.timestamp < 3600000) { // 1 hour cache
        document.getElementById('location').textContent = `Location: ${cachedData.location}`;
        document.getElementById('temperature').textContent = `Temperature: ${cachedData.temperature}°C`;
        document.getElementById('description').textContent = `Description: ${cachedData.description}`;
        document.getElementById('icon').setAttribute('src', cachedData.icon);
      }
    };

    const getWeatherByCoordinates = (latitude, longitude) => {
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
      fetchWeather(apiUrl);
    };

    const getWeatherByCity = (city) => {
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
      fetchWeather(apiUrl);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        loadCachedWeather();
        getWeatherByCoordinates(latitude, longitude);
      }, () => {
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Geolocation is not supported by your browser or permission denied. Please enter location manually.';
      });
    } else {
      errorMessage.style.display = 'block';
      errorMessage.textContent = 'Geolocation is not supported by your browser. Please enter location manually.';
    }

    fetchWeatherButton.addEventListener('click', () => {
      const city = cityInput.value;
      if (city) {
        errorMessage.style.display = 'none';
        getWeatherByCity(city);
      } else {
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Please enter a city name.';
      }
    });

    loadCachedWeather();
  };

  fetchApiKey();
});

// Register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}
