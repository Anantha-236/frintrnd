import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Account.css';
const API_BASE = 'http://localhost:8080/users'; // Update if backend runs elsewhere

const Account = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', fullname: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (isLogin) {
            // LOGIN
            try {
                const res = await axios.post(`${API_BASE}/signin`, {
                    email: formData.email,
                    password: formData.password
                });
                if (res.data.includes('200')) {
                    // Extract token from response (format: "200 ::<token>")
                    const token = res.data.split('::')[1].trim();
                    localStorage.setItem('csrid', token);
                    navigate('/weather2');
                } else {
                    setError('Invalid credentials');
                }
            } catch (err) {
                setError('Login failed. Please check your credentials.');
            }
        } else {
            // REGISTER
            try {
                const res = await axios.post(`${API_BASE}/signup`, {
                    email: formData.email,
                    password: formData.password,
                    fullname: formData.fullname
                });
                if (res.data.includes('200')) {
                    setSuccess('Registration successful! Please login.');
                    setIsLogin(true);
                } else {
                    setError('Registration failed. Email may already exist.');
                }
            } catch (err) {
                setError('Registration failed. Email may already exist.');
            }
        }
    };

    return (
        <div className="account-container">
            <div className="form-container">
                <h2>{isLogin ? 'Login' : 'Register'}</h2>
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <input
                            type="text"
                            name="fullname"
                            placeholder="Full Name"
                            value={formData.fullname}
                            onChange={handleInputChange}
                            required
                        />
                    )}
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                    <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
                </form>
                <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}>
                    {isLogin ? 'Switch to Register' : 'Switch to Login'}
                </button>
                {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
                {success && <div style={{ color: 'green', marginTop: 10 }}>{success}</div>}
            </div>
        </div>
    );
};

export default Account;