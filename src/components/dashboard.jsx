import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Weather.css';

export const WeatherDashboard = () => {
    const [weather, setWeather] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [clothingRecommendations, setClothingRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

    const fetchWeatherData = async (lat, lon) => {
        try {
            setIsLoading(true);
            setError('');
            const [currentRes, forecastRes] = await Promise.all([
                axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`),
                axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
            ]);

            const processedData = processWeatherData(currentRes.data, forecastRes.data);
            setWeather(processedData);
            generateRecommendations(processedData);
            checkSevereAlerts(processedData);
        } catch (err) {
            setError('Failed to fetch weather data');
        } finally {
            setIsLoading(false);
        }
    };

    const processWeatherData = (current, forecast) => {
        return {
            current: {
                temp: current.main.temp,
                weather: current.weather,
                rain: current.rain,
                wind_speed: current.wind.speed,
                uvi: current.uvi || 0
            },
            daily: forecast.list.slice(0, 5).map(item => ({
                temp_max: item.main.temp_max,
                pop: item.pop
            }))
        };
    };

    const checkSevereAlerts = (weatherData) => {
        const newAlerts = [];
        if (weatherData.current.rain && weatherData.current.rain['1h'] > 20) {
            newAlerts.push('Heavy rainfall warning - risk of flooding');
        }
        if (weatherData.current.temp < 0) {
            newAlerts.push('Freezing temperatures - risk of ice formation');
        }
        if (weatherData.current.wind_speed > 10) {
            newAlerts.push('Strong winds - secure outdoor objects');
        }
        setAlerts(newAlerts);
    };

    const generateRecommendations = (weatherData) => {
        const recommendations = [];
        const temp = weatherData.current.temp;

        if (temp < 5) recommendations.push('Heavy coat, gloves, and hat');
        else if (temp < 15) recommendations.push('Jacket or sweater');
        else if (temp < 25) recommendations.push('Light layers');
        else recommendations.push('Lightweight, breathable clothing');

        if (weatherData.current.weather[0].main === 'Rain') {
            recommendations.push('Waterproof jacket and boots');
        }

        if (weatherData.current.uvi > 3) {
            recommendations.push('Sunscreen and sunglasses recommended');
        }

        setClothingRecommendations(recommendations);
    };

    const sendWeatherReport = async () => {
        try {
            await axios.post('/api/send-weather-report', {
                email: 'user@example.com',
                weather: {
                    temp: weather.current.temp,
                    condition: weather.current.weather[0].description,
                    alerts
                }
            });
            alert('Weather report sent successfully!');
        } catch (err) {
            setError('Failed to send weather report');
        }
    };

    const getAgriculturalAdvisory = () => {
        if (!weather) return [];
        const advisories = [];
        const soilMoisture = 30; // Placeholder for soil moisture calculation

        if (weather.daily[0].temp_max > 35) {
            advisories.push('Heat stress warning for crops - increase irrigation');
        }
        if (weather.daily[0].pop > 0.5) {
            advisories.push('Expected rainfall - delay fertilizer application');
        }
        if (soilMoisture < 30) {
            advisories.push('Low soil moisture - recommend irrigation');
        }

        return advisories;
    };

    return (
        <div className="weather-app">
            {isLoading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}

            {weather && (
                <div>
                    {alerts.length > 0 && (
                        <div className="alert-banner">
                            <h3>⚠️ Weather Alerts</h3>
                            {alerts.map((alert, index) => (
                                <div key={index} className="alert-item">{alert}</div>
                            ))}
                        </div>
                    )}

                    <div className="recommendation-section">
                        <h3>👕 Recommended Attire</h3>
                        <div className="recommendation-grid">
                            {clothingRecommendations.map((item, index) => (
                                <div key={index} className="recommendation-item">{item}</div>
                            ))}
                        </div>
                    </div>

                    <button className="email-report-button" onClick={sendWeatherReport}>
                        📧 Send Report to My Email
                    </button>

                    <div className="advisory-section">
                        <h3>🌱 Agricultural Advisory</h3>
                        {getAgriculturalAdvisory().map((advice, index) => (
                            <div key={index} className="advisory-item">{advice}</div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};