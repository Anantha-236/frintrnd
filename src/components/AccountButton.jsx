import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import accountIcon from '../assets/Account.gif';
import './Weather.css';

const AccountButton = ({ to }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const buttonRef = useRef(null);

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleButtonClick = () => {
    if (to === 'login') {
      navigate('/login');
    } else {
      setShowMenu((prev) => !prev);
    }
  };

  const handleProfile = () => {
    setShowMenu(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setShowMenu(false);
    // Optionally clear auth tokens here
    navigate('/weather');
  };

  return (
    <div className="account-button-wrapper" ref={buttonRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button className="account-button" onClick={handleButtonClick} title={to === 'login' ? 'Login/Register' : 'Account'}>
        <img src={accountIcon} alt="Account" className="account-icon" />
      </button>
      {showMenu && to !== 'login' && (
        <div className="account-dropdown-menu" style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #ccc', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 100 }}>
          <button className="account-dropdown-item" onClick={handleProfile} style={{ display: 'block', width: '100%', padding: '8px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>Profile</button>
          <button className="account-dropdown-item" onClick={handleLogout} style={{ display: 'block', width: '100%', padding: '8px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default AccountButton;
