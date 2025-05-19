// src/pages/WatchlistPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { getUserWatchlist, removeFromWatchlist } from "../services/firestoreService";
import { IMAGE_BASE_URL } from "../config/config.js"; // Make sure .js extension if needed, or that vite handles it
import MovieCard from "../components/MovieCard";
import "../styles/WatchlistPage.css";
import "../styles/App.css";

const WatchlistPage = () => {
  const { currentUser } = useAuth();
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state for UI feedback
  const navigate = useNavigate();

  console.log("[B1 - WatchlistPage] Rendering. CurrentUser:", currentUser ? currentUser.uid : 'None');

  useEffect(() => {
    if (!currentUser) {
      console.log("[B2 - WatchlistPage useEffect] No currentUser. ProtectedRoute should handle this.");
      setLoading(false); // Stop loading, ProtectedRoute will redirect
      // navigate("/login"); // Usually handled by ProtectedRoute
      return;
    }

    const fetchWatchlist = async () => {
      console.log("[B3 - WatchlistPage useEffect] Fetching watchlist for user:", currentUser.uid);
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const moviesFromFirestore = await getUserWatchlist(currentUser.uid);
        console.log("[B4 - WatchlistPage useEffect] Raw moviesFromFirestore (from getUserWatchlist):", moviesFromFirestore);

        if (Array.isArray(moviesFromFirestore)) {
          if (moviesFromFirestore.length > 0) {
            const formattedMovies = moviesFromFirestore.map((firestoreMovie) => {
              console.log("[B5 - WatchlistPage useEffect] Formatting firestoreMovie:", firestoreMovie);
              console.log("[B5.1 - WatchlistPage useEffect] IMAGE_BASE_URL for poster construction is:", IMAGE_BASE_URL);

              if (typeof firestoreMovie.movieId === 'undefined' || !firestoreMovie.title) {
                  console.warn("[B5.2 - WatchlistPage useEffect] Skipping due to missing movieId or title:", firestoreMovie);
                  return null;
              }

              let constructedPosterPath = null;
              if (IMAGE_BASE_URL && firestoreMovie.poster_path) {
                constructedPosterPath = `${IMAGE_BASE_URL}${firestoreMovie.poster_path}`;
              } else if (firestoreMovie.poster_path) {
                // IMAGE_BASE_URL is missing, but poster_path exists, log warning but use relative
                console.warn("[B5.3 - WatchlistPage useEffect] IMAGE_BASE_URL is undefined/null, but poster_path exists. Poster will likely be broken for MovieCard:", firestoreMovie.poster_path);
                constructedPosterPath = firestoreMovie.poster_path; // Will likely result in broken image if MovieCard doesn't prepend
              }

              return {
                id: firestoreMovie.movieId,
                title: firestoreMovie.title,
                poster_path: constructedPosterPath, // This is now the FULL URL or null (or relative if IMAGE_BASE_URL was missing)
                vote_average: firestoreMovie.vote_average,
                release_date: firestoreMovie.release_date,
              };
            }).filter(movie => movie !== null);

            console.log("[B6 - WatchlistPage useEffect] CRITICAL: Formatted movies for UI (count):", formattedMovies.length, "Data:", formattedMovies);
            setWatchlistMovies(formattedMovies);
          } else {
             console.log("[B6.1 - WatchlistPage useEffect] moviesFromFirestore is empty array.");
             setWatchlistMovies([]); // Explicitly set to empty if API returns empty
          }
        } else {
          console.warn("[B7 - WatchlistPage useEffect] moviesFromFirestore is not an array. Received:", moviesFromFirestore);
          setError("Failed to load watchlist: Invalid data received.");
          setWatchlistMovies([]);
        }
      } catch (err) {
        console.error("[B8 - WatchlistPage useEffect] Error in fetchWatchlist:", err);
        setError("Failed to fetch watchlist. Please try again.");
        setWatchlistMovies([]);
      } finally {
        setLoading(false);
        console.log("[B9 - WatchlistPage useEffect] Finished fetching, loading set to false.");
      }
    };

    fetchWatchlist();
  }, [currentUser, navigate]); // `navigate` isn't strictly needed if only used in !currentUser block

  const handleRemoveFromWatchlist = async (movieIdToRemove) => {
    if (!currentUser) return;
    console.log("[WatchlistPage] handleRemoveFromWatchlist called for movieId:", movieIdToRemove);
    try {
      await removeFromWatchlist(currentUser.uid, movieIdToRemove);
      setWatchlistMovies((prevMovies) =>
        prevMovies.filter((movie) => movie.id !== movieIdToRemove)
      );
      console.log("[WatchlistPage] Movie removed from UI state.");
    } catch (error) {
      console.error("[WatchlistPage] Error removing movie:", error);
      alert("Failed to remove movie. Please try again.");
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  console.log("[B10 - WatchlistPage render] State before return - loading:", loading, "watchlistMovies count:", watchlistMovies.length, "error:", error);

  if (loading) {
    return (
      <div className="loading-container"> {/* Consistent class for loading states */}
        <motion.div /* ... loading animation ... */ > Loading your watchlist... </motion.div>
      </div>
    );
  }

  if (error) { // Display error message to the user
    return (
        <div className="watchlist-page-container">
            <h1 className="page-title">My Watchlist</h1>
            <div className="error-message">{error}</div>
        </div>
    );
  }

  if (watchlistMovies.length === 0) {
    console.log("[B10.1 - WatchlistPage render] Watchlist is empty, showing 'empty' message.");
    return (
      <motion.div className="watchlist-page-container" /*...*/ >
        <h1 className="page-title">My Watchlist</h1>
        <motion.div className="empty-watchlist" /*...*/ >
          <p>Your watchlist is currently empty.</p>
          <Link to="/" className="browse-movies-link"> Browse Movies </Link>
        </motion.div>
      </motion.div>
    );
  }

  console.log("[B10.2 - WatchlistPage render] Watchlist has items, preparing to map to MovieCards.");
  return (
    <motion.div className="watchlist-page-container" /* ... */ >
      <h1 className="page-title">My Watchlist</h1>
      <AnimatePresence>
        <motion.div className="movies-grid watchlist-grid" /* ... */ >
          {watchlistMovies.map((movieForCard, index) => {
            console.log(`[B11 - WatchlistPage render map] Passing to MovieCard (index ${index}):`, movieForCard);
            if (!movieForCard || typeof movieForCard.id === 'undefined') {
              console.error("[B11.1 - WatchlistPage render map] Invalid movieForCard object, skipping render:", movieForCard);
              return null;
            }
            return (
              <motion.div
                key={movieForCard.id}
                className="watchlist-item-wrapper"
                // ... animation props ...
              >
                <MovieCard movie={movieForCard} onClick={() => handleMovieClick(movieForCard.id)} />
                <motion.button
                  className="remove-from-watchlist-btn"
                  onClick={() => handleRemoveFromWatchlist(movieForCard.id)}
                  // ... animation props ...
                >
                  Remove
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default WatchlistPage;