import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Weather.css';
import './weather.css';
import searchicon from '../assets/search-icon.png';
import X from '../assets/X.png';
import Youtube from '../assets/Youtube.png';
import Facebook from '../assets/Facebook.png';
import linkedin from '../assets/linkedin.png';
import sunny from '../assets/sunny.gif';
import rainy from '../assets/rainy.gif';
import snowy from '../assets/snowy.gif';
import cloudy from '../assets/cloudy.gif';
import stormy from '../assets/stormy.gif';
import foggy from '../assets/foggy.gif';
import accountIcon from '../assets/Account.gif';
import AccountButton from './AccountButton';

export const Weather = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiKey = '8b735596066c95257fa41034d150dea0';

  const fetchWeather = async (url) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await axios.get(url);
      setWeather(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'City not found. Please try again.');
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeatherByCity = (cityName) => {
    fetchWeather(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`
    );
  };

  const fetchWeatherByCoords = (lat, lon) => {
    fetchWeather(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
  };

  const handleInputChange = (e) => {
    setCity(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeatherByCity(city);
      setCity('');
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        () => {
          setError('Geolocation is not enabled. Please allow location access.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  const getWeatherClass = (weatherCondition) => {
    if (!weatherCondition) return '';
    const condition = weatherCondition.toLowerCase();
    if (condition === 'clear') return 'sunny';
    if (condition === 'rain') return 'rainy';
    if (condition === 'snow') return 'snowy';
    if (condition === 'clouds') return 'cloudy';
    if (condition === 'thunderstorm') return 'stormy';
    if (['mist', 'haze', 'fog'].includes(condition)) return 'foggy';
    return '';
  };

  const getSuggestion = (weatherCondition) => {
    const suggestions = {
      clear: "Perfect day for outdoor activities! Don't forget sunscreen!",
      rain: "Don't forget your umbrella! Stay dry!",
      snow: "Wrap up warm and be careful on icy roads!",
      clouds: "Great day for a walk in the park!",
      thunderstorm: "Stay indoors and avoid electrical equipment!",
      mist: "Drive carefully in low visibility!",
      haze: "Consider wearing a mask if air quality is poor!",
      fog: "Use low-beam headlights while driving!"
    };
    return suggestions[weatherCondition.toLowerCase()] || "Enjoy your day!";
  };



  return (
    <div className="weather-app">
      <>
        <nav className="navbar">
          <h1 className="app-title">Weather App</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              style={{
                marginRight: 0,
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(90deg, #4a90e2 60%, #6c5ce7 100%)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onClick={() => window.location.href = '/dashboard'}
            >
              <span role="img" aria-label="dashboard" style={{ fontSize: '1.3em' }}>🌦️</span>
              Weather Dashboard
            </button>
            <button
              style={{
                marginRight: 0,
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(90deg, #00b894 60%, #00cec9 100%)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onClick={() => window.location.href = '/send-weather-report'}
            >
              <span role="img" aria-label="send" style={{ fontSize: '1.3em' }}>📤</span>
              Send Weather Report
            </button>
            <AccountButton to="login" />
          </div>
        </nav>

        <div className="content-wrapper">
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-container">
              <input
                type="text"
                placeholder="Enter city name"
                value={city}
                onChange={handleInputChange}
                className="search-input"
                aria-label="Enter city name"
              />
              <button type="submit" className="search-button" disabled={isLoading}>
                <img src={searchicon} alt="Search" className="search-icon" />
              </button>
            </div>
          </form>

          {isLoading && <div className="loading">Loading...</div>}
          {error && <div className="error-message">{error}</div>}

          {weather && (
            <div>
              <div className={`weather-card ${getWeatherClass(weather.weather[0].main)}`}>
                <div className="weather-card-header">
                  <h2 className="city-name">{weather.name}</h2>
                  <div className="weather-condition">{weather.weather[0].description}</div>
                </div>

                <div className="weather-card-body">
                  <div className="temperature">{Math.round(weather.main.temp)}°C</div>

                  <div className="animated-weather-icon">
                    <img
                      src={(() => {
                        const condition = weather.weather[0].main.toLowerCase();
                        const currentHour = new Date().getHours();

                        if (condition === 'clear') {
                          if (currentHour >= 6 && currentHour < 18) return sunny; // Daytime
                          return cloudy; // Nighttime
                        }
                        if (condition === 'rain') {
                          if (currentHour >= 6 && currentHour < 18) return rainy; // Daytime Rain
                          return rainy; // Nighttime Rain
                        }
                        if (condition === 'snow') {
                          if (currentHour >= 6 && currentHour < 18) return snowy; // Daytime Snow
                          return snowy; // Nighttime Snow
                        }
                        if (condition === 'clouds') {
                          if (currentHour >= 6 && currentHour < 18) return cloudy; // Daytime Clouds
                          return cloudy; // Nighttime Clouds
                        }
                        if (condition === 'thunderstorm') {
                          return stormy; // Thunderstorm
                        }
                        if (['mist', 'haze', 'fog'].includes(condition)) {
                          return foggy; // Foggy
                        }
                        return null;
                      })()}
                      alt={weather.weather[0].main}
                    />
                  </div>

                  <div className="weather-details">
                    <div className="detail-item">
                      <span className="detail-label">Humidity</span>
                      <span className="detail-value">{weather.main.humidity}%</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Wind Speed</span>
                      <span className="detail-value">{weather.wind.speed} m/s</span>
                    </div>
                  </div>

                  <div className="suggestion">
                    {getSuggestion(weather.weather[0].main)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="app-footer">
          <div className="social-links">
            <img src={Youtube} alt="YouTube" className="social-icon" />
            <img src={X} alt="Twitter" className="social-icon" />
            <img src={Facebook} alt="Facebook" className="social-icon" />
            <img src={linkedin} alt="LinkedIn" className="social-icon" />
          </div>
          <p className="copyright">&copy; 2023 Weather App. All rights reserved.</p>
        </footer>
      </>
    </div>
  );
};

export default Weather;