import React, { useState } from 'react';
import axios from 'axios';

const SendWeatherReportButton = () => {
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSendReport = async () => {
    try {
      setStatus('Sending...');
      const response = await axios.post('/api/weather-report', { city, email });
      if (response.status === 200) {
        setStatus('Weather report sent successfully!');
      } else {
        setStatus('Failed to send weather report.');
      }
    } catch (error) {
      setStatus('Error occurred while sending the report.');
    }
  };

  return (
    <div className="send-weather-report">
      <h3>Send Weather Report</h3>
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <input
        type="email"
        placeholder="Enter recipient email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSendReport}>Send Report</button>
      {status && <p className="status-message">{status}</p>}
    </div>
  );
};

export default SendWeatherReportButton;
