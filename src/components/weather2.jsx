import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Weather2.css';
import './weather2.css';
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
import AccountButton from './AccountButton';
import { useAuth } from '../context/AuthContext';
import { WeatherDashboard } from './dashboard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const Weather2 = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [location, setLocation] = useState({ name: '', country: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiKey = '8b735596066c95257fa41034d150dea0';

  const navigate = useNavigate();

  // Fetch current weather and forecast
  const fetchWeatherData = async (lat, lon, name, country) => {
    try {
      setIsLoading(true);
      setError('');
      const [currentRes, forecastRes] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
      ]);
      setWeather(currentRes.data);
      setForecast(forecastRes.data);
      setLocation({ name, country });
    } catch (err) {
      setError('Failed to fetch weather data.');
      setWeather(null);
      setForecast(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch by city name
  const fetchWeatherByCity = async (cityName) => {
    try {
      setIsLoading(true);
      setError('');
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`
      );
      if (geoResponse.data.length === 0) {
        throw new Error('City not found');
      }
      const { lat, lon, name, country } = geoResponse.data[0];
      fetchWeatherData(lat, lon, name, country);
    } catch (err) {
      setError('City not found. Please try again.');
      setWeather(null);
      setForecast(null);
      setIsLoading(false);
    }
  };

  // Fetch by geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          axios.get(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`
          )
            .then(geoResponse => {
              if (geoResponse.data.length > 0) {
                const { name, country } = geoResponse.data[0];
                fetchWeatherData(latitude, longitude, name, country);
              }
            })
            .catch(() => setError('Failed to get location info.'));
        },
        () => {
          setError('Geolocation is not enabled. Please allow location access.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
    // eslint-disable-next-line
  }, []);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('User details:', user);
    } else {
      console.log('No user logged in');
    }
  }, [user]);

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

  const getWeatherIcon = (condition) => {
    const conditionLower = condition.toLowerCase();
    switch (conditionLower) {
      case 'clear': return sunny;
      case 'rain': return rainy;
      case 'snow': return snowy;
      case 'clouds': return cloudy;
      case 'thunderstorm': return stormy;
      case 'mist':
      case 'haze':
      case 'fog': return foggy;
      default: return sunny;
    }
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

  // Format time for forecast
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format day for forecast
  const formatDay = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString([], { weekday: 'long' });
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  // Added detailed suggestions and visual components
  const getDetailedSuggestions = () => {
    if (!weather) return [];
    const temp = weather.main.temp;
    const condition = weather.weather[0].main.toLowerCase();
    const uv = weather.main.uvi;
    const wind = weather.wind.speed;

    const suggestions = [];

    // Temperature-based suggestions
    if (temp < 0) {
      suggestions.push({
        icon: '❄️',
        text: "Extreme cold warning! Wear thermal layers and avoid prolonged exposure"
      });
    } else if (temp < 10) {
      suggestions.push({
        icon: '🧥',
        text: "Chilly weather! Wear a warm jacket and gloves"
      });
    } else if (temp > 30) {
      suggestions.push({
        icon: '🥵',
        text: "Heat warning! Stay hydrated and avoid direct sun exposure"
      });
    }

    // UV Index suggestions
    if (uv >= 8) {
      suggestions.push({
        icon: '🕶️',
        text: "Very high UV! Use SPF 50+ sunscreen and wear UV-protective clothing"
      });
    } else if (uv >= 6) {
      suggestions.push({
        icon: '☀️',
        text: "High UV! Apply sunscreen every 2 hours"
      });
    }

    // Wind suggestions
    if (wind > 10) {
      suggestions.push({
        icon: '🌬️',
        text: "Strong winds! Secure loose objects and be cautious outdoors"
      });
    }

    // Condition-specific suggestions
    switch (condition) {
      case 'rain':
        suggestions.push({
          icon: '🌧️',
          text: "Rain expected! Allow extra travel time and check drainage around your property"
        });
        break;
      case 'snow':
        suggestions.push({
          icon: '🧊',
          text: "Icy conditions! Use winter tires and keep emergency supplies in your vehicle"
        });
        break;
      case 'thunderstorm':
        suggestions.push({
          icon: '⚡',
          text: "Thunderstorm alert! Unplug electronics and avoid using landline phones"
        });
        break;
    }

    return suggestions;
  };

  const WeatherIndicator = ({ label, value, unit, icon }) => (
    <div className="detail-item">
      <div className="indicator-header">
        <span className="indicator-icon">{icon}</span>
        <span className="detail-label">{label}</span>
      </div>
      <div className="indicator-value">
        {value} {unit}
      </div>
    </div>
  );

  const UVProgressBar = ({ value }) => {
    const uvLevel = value >= 8 ? 'high' : value >= 6 ? 'moderate' : 'low';
    return (
      <div className="progress-container">
        <div 
          className={`uv-progress ${uvLevel}`}
          style={{ width: `${Math.min(value * 10, 100)}%` }}
        />
        <div className="uv-level-label">{uvLevel.toUpperCase()} RISK</div>
      </div>
    );
  };

  // Utility function to calculate sun position and moon phase
  const calculateSunPosition = (timestamp, lat, lon, sunrise, sunset) => {
    const date = new Date(timestamp * 1000);
    const currentHours = date.getHours();

    // Calculate sun angle (simplified version)
    const totalDaylight = sunset - sunrise;
    const timeSinceSunrise = timestamp - sunrise;
    const sunAngle = (timeSinceSunrise / totalDaylight) * 180; // 0° to 180°

    // Calculate moon phase for nighttime
    const moonPhase = ((date.getDate() % 30) / 30) * 360;

    return {
      isDaytime: timestamp > sunrise && timestamp < sunset,
      sunAngle: sunAngle || 0,
      moonPhase,
      currentHours
    };
  };

  const handleSendWeatherReport = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/weather-report/send-today', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Weather report sent to all users!');
    } catch (err) {
      alert('Failed to send weather report.');
    }
  };

  return (
    <div className="weather-app">
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
            onClick={() => navigate('/dashboard')}
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
            onClick={handleSendWeatherReport}
          >
            <span role="img" aria-label="send" style={{ fontSize: '1.3em' }}>📤</span>
            Send Weather Report
          </button>
          <AccountButton to="profile" />
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
                <h2 className="city-name">{location.name}</h2>
                <div className="weather-date">
                  {formatDate(weather.dt)} • Local Time: {formatTime(weather.dt)}
                </div>
              </div>

              <div className="weather-card-body">
                <div className="temperature-section">
                  <div className="temperature">
                    {Math.round(weather.main.temp)}°C
                    <div className="feels-like">
                      Feels like {Math.round(weather.main.feels_like)}°C
                    </div>
                  </div>
                  <div className="animated-weather-icon">
                    <img 
                      src={getWeatherIcon(weather.weather[0].main)} 
                      alt={weather.weather[0].description} 
                    />
                  </div>
                </div>

                <div className="weather-details-grid">
                  <WeatherIndicator 
                    label="Humidity" 
                    value={weather.main.humidity} 
                    unit="%" 
                    icon="💧"
                  />
                  <div className="detail-item uv-item">
                    <div className="indicator-header">
                      <span className="indicator-icon">☀️</span>
                      <span className="detail-label">UV Index</span>
                    </div>
                    <UVProgressBar value={weather.main.uvi} />
                  </div>
                  <WeatherIndicator 
                    label="Wind Speed" 
                    value={weather.wind.speed} 
                    unit="m/s" 
                    icon="🌪️"
                  />
                  <WeatherIndicator 
                    label="Air Quality" 
                    value={weather.main.air_quality || '--'} 
                    unit="AQI" 
                    icon="🍃"
                  />
                </div>

                <div className="extended-suggestions">
                  <h4>Recommended Actions:</h4>
                  {getDetailedSuggestions().map((suggestion, index) => (
                    <div key={index} className="suggestion-item">
                      <span className="suggestion-icon">{suggestion.icon}</span>
                      {suggestion.text}
                    </div>
                  ))}
                </div>

                {/* New Health Index Section */}
                <div className="health-index">
                  <div className="index-item">
                    <div className="index-label">Comfort Level</div>
                    <div className="index-value">
                      {weather.main.humidity > 70 ? 'Muggy' : 
                       weather.main.humidity < 30 ? 'Dry' : 'Comfortable'}
                    </div>
                  </div>
                  <div className="index-item">
                    <div className="index-label">Outdoor Safety</div>
                    <div className="index-value">
                      {weather.weather[0].main === 'Thunderstorm' ? 'Dangerous' :
                       weather.wind.speed > 15 ? 'Caution' : 'Safe'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Forecast Section */}
            {forecast && (
              <div className="forecast-section">
                <h3>Hourly Forecast</h3>
                <div className="hourly-container">
                  {forecast.list.slice(0, 6).map((hour, index) => (
                    <div key={index} className="hourly-item">
                      <div className="hourly-time">{formatTime(hour.dt)}</div>
                      <img 
                        src={getWeatherIcon(hour.weather[0].main)} 
                        alt={hour.weather[0].description}
                        className="hourly-icon" 
                      />
                      <div className="hourly-temp">{Math.round(hour.main.temp)}°C</div>
                      <div className="hourly-pop">{Math.round(hour.pop * 100)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Hourly Forecast Section */}
            {forecast && (
              <div className="forecast-section">
                <h3>24-Hour Forecast</h3>
                <div className="hourly-bar">
                  {forecast.list.slice(0, 8).map((hour, index) => (
                    <div key={index} className="hourly-item">
                      <div className="hourly-time">{formatTime(hour.dt)}</div>
                      <img 
                        src={getWeatherIcon(hour.weather[0].main)} 
                        alt={hour.weather[0].description}
                        className="hourly-icon" 
                      />
                      <div className="hourly-temp">{Math.round(hour.main.temp)}°C</div>
                      <div className="hourly-pop">
                        <span className="raindrop">💧</span> 
                        {Math.round(hour.pop * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Forecast Section */}
            {forecast && (
              <div className="forecast-section weekly-forecast">
                <h3>7-Day Forecast</h3>
                <div className="weekly-bar">
                  {forecast.list
                    .filter((_, index) => index % 8 === 0)
                    .slice(0, 7)
                    .map((day, index) => (
                      <div key={index} className="day-item">
                        <div className="day-name">{formatDay(day.dt)}</div>
                        <img
                          src={getWeatherIcon(day.weather[0].main)}
                          alt={day.weather[0].description}
                          className="day-icon"
                        />
                        <div className="temp-range">
                          <span className="high">{Math.round(day.main.temp_max)}°</span>
                          <span className="low">{Math.round(day.main.temp_min)}°</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Enhanced Chart Section */}
            {forecast && (
              <div className="chart-section">
                <h3>24-Hour Temperature Trend</h3>
                <div className="chart-container">
                  <Line
                    data={{
                      labels: forecast.list.slice(0, 8).map(item => formatTime(item.dt)),
                      datasets: [
                        {
                          label: 'Actual Temperature',
                          data: forecast.list.slice(0, 8).map(item => item.main.temp),
                          borderColor: '#ff4444',
                          backgroundColor: 'rgba(255, 68, 68, 0.2)',
                          tension: 0.4
                        },
                        {
                          label: 'Feels Like',
                          data: forecast.list.slice(0, 8).map(item => item.main.feels_like),
                          borderColor: '#4444ff',
                          backgroundColor: 'rgba(68, 68, 255, 0.2)',
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: (context) => 
                              `${context.dataset.label}: ${context.parsed.y}°C`
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Updated Hourly Forecast Section */}
            {forecast && weather && (
              <div className="forecast-section">
                <h3>24-Hour Sun Path Forecast</h3>
                <div className="sun-path-container">
                  <div className="earth-curve">
                    {forecast.list.slice(0, 8).map((hour, index) => {
                      const { isDaytime, sunAngle, moonPhase, currentHours } = 
                        calculateSunPosition(
                          hour.dt,
                          weather.coord.lat,
                          weather.coord.lon,
                          weather.sys.sunrise,
                          weather.sys.sunset
                        );

                      return (
                        <div 
                          key={index}
                          className={`celestial-marker ${isDaytime ? 'sun' : 'moon'}`}
                          style={{
                            left: `${(currentHours / 24) * 100}%`,
                            transform: `translate(-50%, ${Math.sin(sunAngle * Math.PI / 180) * 50}px)`
                          }}
                        >
                          {isDaytime ? (
                            <span className="sun-icon">☀️</span>
                          ) : (
                            <span 
                              className="moon-icon"
                              style={{ transform: `rotate(${moonPhase}deg)` }}
                            >🌙</span>
                          )}
                          <div className="hourly-item">
                            <div className="hourly-time">{formatTime(hour.dt)}</div>
                            <img 
                              src={getWeatherIcon(hour.weather[0].main)} 
                              alt={hour.weather[0].description}
                              className="hourly-icon" 
                            />
                            <div className="hourly-temp">{Math.round(hour.main.temp)}°C</div>
                            <div className="hourly-pop">
                              <span className="raindrop">💧</span> 
                              {Math.round(hour.pop * 100)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
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
    </div>
  );
};

export default Weather2;
