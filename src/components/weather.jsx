import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    fetchWeather(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`);
  };

  const fetchWeatherByCoords = (lat, lon) => {
    fetchWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
  };

  const handleInputChange = (e) => setCity(e.target.value);

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
        () => setError('Geolocation is not enabled. Please allow location access.')
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  const getWeatherClass = (condition) => {
    const cond = condition?.toLowerCase();
    if (cond === 'clear') return 'sunny';
    if (cond === 'rain') return 'rainy';
    if (cond === 'snow') return 'snowy';
    if (cond === 'clouds') return 'cloudy';
    if (cond === 'thunderstorm') return 'stormy';
    if (["mist", "haze", "fog"].includes(cond)) return 'foggy';
    return '';
  };

  const getSuggestion = (condition) => {
    const suggestions = {
      clear: "Perfect day for outdoor activities! Don't forget sunscreen!",
      rain: "Don't forget your umbrella! Stay dry!",
      snow: "Wrap up warm and be careful on icy roads!",
      clouds: "Great day for a walk in the park!",
      thunderstorm: "Stay indoors and avoid electrical equipment!",
      mist: "Drive carefully in low visibility!",
      haze: "Consider wearing a mask if air quality is poor!",
      fog: "Use low-beam headlights while driving!",
    };
    return suggestions[condition.toLowerCase()] || "Enjoy your day!";
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <nav style={{
        position: 'fixed', top: 0, left: 0, width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(8px)', color: '#333',
        padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', background: 'linear-gradient(45deg, #4a90e2, #6c5ce7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Weather App</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(90deg, #4a90e2 60%, #6c5ce7 100%)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }} onClick={() => window.location.href = '/dashboard'}>🌦️ Weather Dashboard</button>
          <button style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(90deg, #00b894 60%, #00cec9 100%)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }} onClick={() => window.location.href = '/send-weather-report'}>📤 Send Weather Report</button>
          <AccountButton to="login" />
        </div>
      </nav>

      <div style={{ marginTop: 120, width: '100%', maxWidth: 500, padding: 20, textAlign: 'center' }}>
        <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', position: 'relative', alignItems: 'center' }}>
            <input type="text" placeholder="Enter city name" value={city} onChange={handleInputChange} style={{ width: '100%', padding: '15px 20px', fontSize: 18, border: '2px solid #ddd', borderRadius: 30, outline: 'none' }} />
            <button type="submit" style={{ position: 'absolute', right: 10, background: 'none', border: 'none', cursor: 'pointer' }} disabled={isLoading}>
              <img src={searchicon} alt="Search" style={{ width: 25, height: 25 }} />
            </button>
          </div>
        </form>

        {isLoading && <div>Loading...</div>}
        {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}

        {weather && (
          <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: 20, padding: 30, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', marginTop: 20 }}>
            <h2>{weather.name}</h2>
            <p style={{ textTransform: 'capitalize' }}>{weather.weather[0].description}</p>
            <h1>{Math.round(weather.main.temp)}°C</h1>
            <img src={(() => {
              const condition = weather.weather[0].main.toLowerCase();
              if (condition === 'clear') return sunny;
              if (condition === 'rain') return rainy;
              if (condition === 'snow') return snowy;
              if (condition === 'clouds') return cloudy;
              if (condition === 'thunderstorm') return stormy;
              if (["mist", "haze", "fog"].includes(condition)) return foggy;
              return null;
            })()} alt={weather.weather[0].main} style={{ width: 100, height: 100 }} />
            <div style={{ marginTop: 10 }}>
              <p><strong>Humidity:</strong> {weather.main.humidity}%</p>
              <p><strong>Wind Speed:</strong> {weather.wind.speed} m/s</p>
            </div>
            <p style={{ marginTop: 10 }}>{getSuggestion(weather.weather[0].main)}</p>
          </div>
        )}
      </div>

      <footer style={{ marginTop: 'auto', textAlign: 'center', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 10 }}>
          <img src={Youtube} alt="YouTube" style={{ width: 30 }} />
          <img src={X} alt="Twitter" style={{ width: 30 }} />
          <img src={Facebook} alt="Facebook" style={{ width: 30 }} />
          <img src={linkedin} alt="LinkedIn" style={{ width: 30 }} />
        </div>
        <p>&copy; 2023 Weather App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Weather;