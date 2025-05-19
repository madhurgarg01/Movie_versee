// src/pages/MovieDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchMovieDetails, IMAGE_BASE_URL, IMAGE_BACKDROP_BASE_URL } from '../services/tmdbService';
import { useAuth } from '../contexts/AuthContext'; // <-- IMPORT AuthContext
import {
  addToWatchlist,
  removeFromWatchlist,
  isMovieInWatchlist
} from '../services/firestoreService'; // <-- IMPORT Firestore service
import '../styles/MovieDetailPage.css';

// ... (pageVariants and pageTransition remain the same) ...
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};


const MovieDetailPage = () => {
  const { id: movieIdParam } = useParams(); // Get movie ID from URL
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth(); // <-- Get current user
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);

  useEffect(() => {
    const movieId = parseInt(movieIdParam); // Ensure movieId is a number if tmdbService expects it
    if (!movieId) {
        setError("Invalid Movie ID");
        setLoading(false);
        return;
    }

    const getMovieDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMovieDetails(movieId);
        if (data) {
          setMovie(data);
        } else {
          setError('Movie not found.');
        }
      } catch (err) {
        console.error('Failed to fetch movie details:', err);
        setError('Failed to load movie details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    getMovieDetails();
  }, [movieIdParam]);

  // Effect to check if movie is in watchlist when component mounts or user/movie changes
  useEffect(() => {
    if (currentUser && movie) {
      const checkWatchlistStatus = async () => {
        setIsWatchlistLoading(true);
        const status = await isMovieInWatchlist(currentUser.uid, movie.id);
        setIsInWatchlist(status);
        setIsWatchlistLoading(false);
      };
      checkWatchlistStatus();
    } else {
      setIsInWatchlist(false); // Reset if no user or movie
    }
  }, [currentUser, movie]);


  const handleToggleWatchlist = async () => {
    if (!currentUser) {
      alert("Please log in to add movies to your watchlist.");
      // Optionally, navigate to login page: navigate('/login');
      return;
    }
    if (!movie) return;

    setIsWatchlistLoading(true);
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(currentUser.uid, movie.id);
        setIsInWatchlist(false);
      } else {
        // Pass the necessary movie details
        const movieDataForWatchlist = {
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            vote_average: movie.vote_average
        };
        await addToWatchlist(currentUser.uid, movieDataForWatchlist);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error("Failed to update watchlist", error);
      alert("Error updating watchlist. Please try again.");
    } finally {
      setIsWatchlistLoading(false);
    }
  };


  if (loading) return <div className="loading-details">Loading movie details...</div>;
  if (error) return <div className="error-details">{error} <Link to="/">Go Home</Link></div>;
  if (!movie) return <div className="error-details">Movie data not available. <Link to="/">Go Home</Link></div>;

  const backdropPath = movie.backdrop_path ? `${IMAGE_BACKDROP_BASE_URL}${movie.backdrop_path}` : '';
  const posterPath = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Image';

  const mainTrailer = movie.videos?.results?.find(
    (video) => video.site === 'YouTube' && video.type === 'Trailer'
  );

  return (
    <motion.div
      className="movie-detail-page"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {/* ... (backdrop and existing content remains the same) ... */}
      {backdropPath && (
        <motion.div
          className="backdrop-image"
          style={{ backgroundImage: `url(${backdropPath})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
      )}
      <div className="movie-detail-content-wrapper">
        <div className="movie-detail-content">
          <motion.div
            className="poster-container"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img src={posterPath} alt={movie.title} className="movie-poster-detail" />
          </motion.div>

          <motion.div
            className="info-container"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h1 className="movie-title-detail">{movie.title}</h1>
            {movie.tagline && <p className="tagline">"{movie.tagline}"</p>}

            <div className="meta-info">
              <span>{movie.release_date?.substring(0, 4)}</span>
              {movie.runtime > 0 && <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
              {movie.vote_average > 0 && (
                <span className="rating">
                  ⭐ {movie.vote_average.toFixed(1)} ({movie.vote_count} votes)
                </span>
              )}
            </div>

            <div className="genres-list">
              {movie.genres?.map((genre) => (
                <span key={genre.id} className="genre-tag">
                  {genre.name}
                </span>
              ))}
            </div>

            <h2 className="section-title">Overview</h2>
            <p className="overview-text">{movie.overview}</p>

            {/* Watchlist Button - Placed prominently */}
            {currentUser && (
                <motion.button
                    className={`action-button watchlist-button ${isInWatchlist ? 'in-watchlist' : ''}`}
                    onClick={handleToggleWatchlist}
                    disabled={isWatchlistLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    {isWatchlistLoading
                    ? 'Updating...'
                    : isInWatchlist
                    ? '✓ Added to Watchlist'
                    : '+ Add to Watchlist'}
                </motion.button>
            )}


            {movie.credits?.cast?.length > 0 && (
              <>
                <h2 className="section-title">Top Billed Cast</h2>
                <div className="cast-list">
                  {movie.credits.cast.slice(0, 8).map((actor) => (
                    <motion.div
                      key={actor.cast_id || actor.id}
                      className="cast-member"
                      whileHover={{ scale: 1.05 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + actor.order * 0.05 }}
                    >
                      <img
                        src={actor.profile_path ? `${IMAGE_BASE_URL}${actor.profile_path}` : 'https://via.placeholder.com/100x150?text=No+Photo'}
                        alt={actor.name}
                      />
                      <p className="actor-name">{actor.name}</p>
                      <p className="character-name">{actor.character}</p>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>

        {mainTrailer && (
          <motion.div
            className="trailer-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h2 className="section-title">Trailer</h2>
            <div className="trailer-video-container">
              <iframe
                src={`https://www.youtube.com/embed/${mainTrailer.key}`}
                title={mainTrailer.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </motion.div>
        )}

        {/* Remove the old placeholder for watchlist */}
        <motion.div
          className="actions-placeholder" // You might rename or remove this if only reviews are left
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          {/* <button className="action-button" onClick={() => alert('Add to Watchlist - Coming Soon!')}>Add to Watchlist</button> */}
          <button className="action-button review-button" onClick={() => alert('Write Review - Coming Soon!')}>Write a Review</button>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default MovieDetailPage;