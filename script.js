window.addEventListener('load', () => {
  const apiKey = '63ba21644414ba68a70e172aadd18def'; // Hardcode your API key here for testing purposes

  const fetchWeatherData = async (latitude, longitude) => {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
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
        }
      }, (error) => {
        console.error('Error getting geolocation:', error);
      });
    } else {
      console.log('Geolocation is not supported by your browser.');
    }
  };

  initializeWeatherApp();
});

