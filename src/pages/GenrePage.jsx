// src/pages/GenrePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMoviesByGenre } from '../services/tmdbService';
import MovieCard from '../components/MovieCard';
import '../styles/App.css'; // For .movies-grid, .loading, .error
import '../styles/GenrePage.css'; // We'll create this

const GenrePage = () => {
  const { genreId, genreName } = useParams(); // Get genreId and name from URL
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!genreId) {
      setError("No genre specified.");
      setLoading(false);
      return;
    }
    fetchGenreMovies(Number(genreId), 1); // Fetch first page on mount or genreId change
  }, [genreId]);

  const fetchGenreMovies = async (id, page) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMoviesByGenre(id, page);
      setMovies(data.results || []);
      setCurrentPage(data.page || 1);
      setTotalPages(data.total_pages || 0);
      if (data.results && data.results.length === 0 && page === 1) {
        setError(`No movies found for ${decodeURIComponent(genreName || 'this genre')}.`);
      }
    } catch (err) {
      console.error(`Failed to fetch movies for genre ${id}:`, err);
      setError('Failed to load movies. Please try again.');
      setMovies([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      fetchGenreMovies(Number(genreId), newPage);
      window.scrollTo(0, 0); // Scroll to top
    }
  };

  return (
    <motion.div
      className="genre-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="page-title genre-page-title"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Movies in: {decodeURIComponent(genreName) || 'Selected Genre'}
      </motion.h1>

      {loading && !movies.length && <div className="loading">Loading movies...</div>}
      {error && <div className="error">{error} <Link to="/">Go Home</Link></div>}

      <AnimatePresence>
        {movies.length > 0 && (
          <motion.div
            className="movies-grid genre-movies-grid"
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
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {totalPages > 1 && movies.length > 0 && (
        <motion.div
          className="pagination-controls" // Reuse styles from SearchPage.css or make specific
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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

export default GenrePage;