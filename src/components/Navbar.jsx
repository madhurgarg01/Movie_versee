// src/components/Navbar.jsx
import React, { useState } from 'react'; // <-- Add useState
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css'; // Ensure you have styles for the new search input

const Navbar = () => {
  const { currentUser, logout, loadingAuth } = useAuth();
  const navigate = useNavigate();
  const [navSearchTerm, setNavSearchTerm] = useState(''); // <-- State for nav search

  const handleLogout = async () => { /* ... */ };

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
          <motion.span whileHover={{ scale: 1.1, color: "#e50914" }} /* ... */ >
            MovieVerse
          </motion.span>
        </Link>

        {/* Optional Navbar Search Form */}
        <form onSubmit={handleNavSearchSubmit} className="nav-search-form">
          <input
            type="text"
            placeholder="Quick search..."
            value={navSearchTerm}
            onChange={(e) => setNavSearchTerm(e.target.value)}
            className="nav-search-input"
          />
          {/* You can make the button an icon or very small */}
        </form>

        <div className="nav-links">
          <Link to="/"><motion.span whileHover={{scale:1.1}}>Home</motion.span></Link>
          {/* The dedicated Search link can still exist or be removed if nav search is prominent */}
          <Link to="/search"><motion.span whileHover={{scale:1.1}}>Search</motion.span></Link>

          {!loadingAuth && (
            <>
              {currentUser ? (
                <>
                  <Link to="/watchlist"><motion.span whileHover={{scale:1.1}}>Watchlist</motion.span></Link>
                  <span className="nav-user-greeting">Hi, {currentUser.displayName || currentUser.email}!</span>
                  <motion.button onClick={handleLogout} /* ... */ >
                    Logout
                  </motion.button>
                </>
              ) : (
                <>
                  <Link to="/login"><motion.span whileHover={{scale:1.1}}>Login</motion.span></Link>
                  <Link to="/register"><motion.span whileHover={{scale:1.1}}>Register</motion.span></Link>
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