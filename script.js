window.addEventListener('load', () => {
  let apiKey;

  const fetchApiKey = async () => {
    try {
      const response = await fetch('/api-key');
      if (!response.ok) {
        throw new Error('Failed to fetch API key');
      }
      const data = await response.json();
      apiKey = data.apiKey;
      initializeWeatherApp();
    } catch (error) {
      console.error('Error fetching API key:', error);
    }
  };

  const initializeWeatherApp = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        fetch(apiUrl)
          .then(response => response.json())
          .then(data => {
            const location = data.name;
            const temperature = data.main.temp;
            const description = data.weather[0].description;
            const icon = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;

            document.getElementById('location').textContent = `Location: ${location}`;
            document.getElementById('temperature').textContent = `Temperature: ${temperature}°C`;
            document.getElementById('description').textContent = `Description: ${description}`;
            document.getElementById('icon').setAttribute('src', icon);
          })
          .catch(error => {
            console.log('Error fetching weather data:', error);
          });
      });
    } else {
      console.log('Geolocation is not supported by your browser.');
    }
  };

  fetchApiKey();
});
