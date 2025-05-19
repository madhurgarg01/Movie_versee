// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WatchlistPage from './pages/WatchlistPage';
import SearchPage from './pages/SearchPage';
import GenrePage from './pages/GenrePage'; // <-- IMPORT
import { useAuth } from './contexts/AuthContext';

import './styles/App.css';
// Import pagination styles if not already global, or ensure SearchPage.css is imported where needed
// import './styles/SearchPage.css'; // Example if pagination styles are there

// ProtectedRoute component ... (remains the same)
const ProtectedRoute = ({ children }) => { /* ... */ };

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movie/:id" element={<MovieDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/genre/:genreId/:genreName" element={<GenrePage />} /> {/* <-- ADD GENRE ROUTE */}
            <Route
              path="/watchlist"
              element={
                <ProtectedRoute>
                  <WatchlistPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;