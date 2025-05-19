// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css'; // Ensure you have styles for the new search input

const Navbar = () => {
  const { currentUser, logout, loadingAuth } = useAuth();
  const navigate = useNavigate();
  const [navSearchTerm, setNavSearchTerm] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error("Failed to log out", error);
      // Optionally, show an error message to the user
    }
  };

  const handleNavSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(navSearchTerm.trim())}`);
      setNavSearchTerm(''); // Clear input after search
    }
  };

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
    >
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <motion.span
            whileHover={{ scale: 1.1, color: "#e50914" }}
            transition={{ duration: 0.2 }}
          >
            MovieVerse
          </motion.span>
        </Link>

        <form onSubmit={handleNavSearchSubmit} className="nav-search-form">
          <input
            type="text"
            placeholder="Quick search..."
            value={navSearchTerm}
            onChange={(e) => setNavSearchTerm(e.target.value)}
            className="nav-search-input"
          />
          {/* A submit button for the search form could be added here if desired,
              but pressing Enter in the input field also submits the form.
              Example: <button type="submit" className="nav-search-submit-btn">Go</button>
          */}
        </form>

        <div className="nav-links">
          <Link to="/"><motion.span whileHover={{scale:1.1}} transition={{ duration: 0.2 }}>Home</motion.span></Link>
          <Link to="/search"><motion.span whileHover={{scale:1.1}} transition={{ duration: 0.2 }}>Search</motion.span></Link>

          {!loadingAuth && (
            <>
              {currentUser ? (
                <>
                  <Link to="/watchlist"><motion.span whileHover={{scale:1.1}} transition={{ duration: 0.2 }}>Watchlist</motion.span></Link>
                  <span className="nav-user-greeting">Hi, {currentUser.displayName || currentUser.email}</span>
                  <motion.button
                    onClick={handleLogout}
                    className="nav-button logout-button" // Apply both classes
                    whileHover={{ scale: 1.05 }} // Framer Motion for scale
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.15 }} // Transition for Framer Motion animations
                  >
                    Logout
                  </motion.button>
                </>
              ) : (
                <>
                  <Link to="/login"><motion.span whileHover={{scale:1.1}} transition={{ duration: 0.2 }}>Login</motion.span></Link>
                  <Link to="/register"><motion.span whileHover={{scale:1.1}} transition={{ duration: 0.2 }}>Register</motion.span></Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;