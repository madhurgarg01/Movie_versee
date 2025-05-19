// src/pages/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { searchMovies } from '../services/tmdbService';
import MovieCard from '../components/MovieCard';
import '../styles/SearchPage.css'; // We'll create this CSS file
import '../styles/App.css'; // For .movies-grid, .loading, .error

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || ''; // Get query from URL

  const [searchTerm, setSearchTerm] = useState(query); // For the input field
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Update input field if URL query changes (e.g., browser back/forward)
    setSearchTerm(query);
    if (query) {
      performSearch(query, 1); // Perform search if query exists in URL
    } else {
      setSearchResults([]); // Clear results if no query
      setTotalPages(0);
    }
  }, [query]); // Rerun effect when URL query 'q' changes

  const performSearch = async (currentQuery, page = 1) => {
    if (!currentQuery.trim()) {
      setSearchResults([]);
      setTotalPages(0);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await searchMovies(currentQuery, page);
      setSearchResults(data.results || []);
      setTotalPages(data.total_pages || 0);
      setCurrentPage(data.page || 1);
      if (data.results && data.results.length === 0) {
        setError(`No results found for "${currentQuery}".`);
      }
    } catch (err) {
      console.error("Failed to search movies:", err);
      setError('Failed to load search results. Please try again.');
      setSearchResults([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() }); // Update URL, triggers useEffect
      // performSearch(searchTerm.trim(), 1); // Also called by useEffect
    } else {
        setSearchParams({}); // Clear query from URL
        setSearchResults([]);
        setTotalPages(0);
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      performSearch(query, newPage);
      window.scrollTo(0, 0); // Scroll to top on page change
    }
  };


  return (
    <motion.div
      className="search-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="page-title"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Search Movies
      </motion.h1>

      <form onSubmit={handleSearchSubmit} className="search-form">
        <motion.input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for movies, e.g., Inception, Batman..."
          className="search-input"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        />
        <motion.button
          type="submit"
          className="search-button"
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {loading ? 'Searching...' : 'Search'}
        </motion.button>
      </form>

      {loading && !searchResults.length && <div className="loading">Searching...</div>}
      {error && <div className="error">{error}</div>}

      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            className="movies-grid search-results-grid"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
          >
            {searchResults.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {totalPages > 1 && searchResults.length > 0 && (
        <motion.div
            className="pagination-controls"
            initial={{opacity: 0, y: 20}}
            animate={{opacity:1, y: 0}}
            transition={{delay: 0.5}}
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            « Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Next »
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SearchPage;