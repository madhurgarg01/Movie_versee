// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchTrendingMovies, fetchGenres } from '../services/tmdbService';
import MovieCard from '../components/MovieCard';
import '../styles/App.css';
import '../styles/HomePage.css';

const HomePage = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getHomePageData = async () => {
      console.log("HomePage useEffect: Starting data fetch..."); // Log 1
      setLoadingMovies(true);
      setLoadingGenres(true);
      setError(null);

      try {
        console.log("HomePage useEffect: Calling Promise.all for trending and genres..."); // Log 2
        const [trendingData, genresData] = await Promise.all([
          fetchTrendingMovies('week'),
          fetchGenres()
        ]);

        console.log("HomePage useEffect: Raw trendingData from API:", trendingData); // Log 3
        console.log("HomePage useEffect: Raw genresData from API:", genresData); // Log 4

        if (trendingData && Array.isArray(trendingData)) {
          setTrendingMovies(trendingData);
          console.log("HomePage useEffect: trendingMovies state set with:", trendingData.length, "items"); // Log 5
        } else {
          console.warn("HomePage useEffect: Trending movies data is not an array or is undefined. Received:", trendingData); // Log 6
          setTrendingMovies([]);
        }

        if (genresData && Array.isArray(genresData)) {
          setGenres(genresData);
          console.log("HomePage useEffect: genres state set with:", genresData.length, "items"); // Log 7
        } else {
          console.warn("HomePage useEffect: Genres data is not an array or is undefined. Received:", genresData); // Log 8
          setGenres([]);
        }

      } catch (err) {
        console.error("HomePage useEffect: Error during data fetch:", err); // Log 9
        setError('Failed to load content. Please check your connection or try again later.');
        setTrendingMovies([]);
        setGenres([]);
      } finally {
        setLoadingMovies(false);
        setLoadingGenres(false);
        console.log("HomePage useEffect: Fetch complete. loadingMovies:", false, "loadingGenres:", false); // Log 10
      }
    };

    getHomePageData();
  }, []);

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  // ... (variants remain the same) ...
  const sectionVariants = { /* ... */ };
  const itemVariants = { /* ... */ };
  const genreLinkVariants = { /* ... */ };

  console.log("HomePage render: loadingMovies:", loadingMovies, "trendingMovies count:", trendingMovies.length, "error:", error); // Log 11 (Just before return)

  return (
    <motion.div
      className="homepage-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Trending Movies Section */}
      <motion.section /* ... */ >
        <h1 className="page-title">Trending This Week</h1>
        {loadingMovies && <div className="loading">Loading trending movies...</div>}
        {error && !loadingMovies && <div className="error">{error}</div>}

        <AnimatePresence>
          {/* Crucial check: ensure trendingMovies IS an array and HAS items */}
          {!loadingMovies && Array.isArray(trendingMovies) && trendingMovies.length > 0 ? (
            <motion.div
              className="movies-grid"
            >
              {trendingMovies.map((movie, index) => {
                // Log inside the map to see what each movie object looks like
                // console.log(`HomePage render: Movie item ${index}:`, movie); // Log 12 (Can be very verbose, use if needed)
                if (!movie || typeof movie.id === 'undefined') {
                  console.error("HomePage render: Invalid movie object in trendingMovies:", movie, "at index:", index); // Log 13
                  return null; // Skip rendering this invalid item
                }
                return (
                  <motion.div key={movie.id || `movie-${index}`} variants={itemVariants}> {/* Fallback key if id is missing */}
                    <MovieCard movie={movie} onClick={handleMovieClick} />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            !loadingMovies && !error && <p className="info-message">No trending movies found this week.</p>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Genres Section ... (rest of the component) ... */}
      <motion.section
        className="home-section genres-section-home"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="section-title-home">Browse by Genre</h2>
        {loadingGenres && <div className="loading">Loading genres...</div>}
        {error && !loadingGenres && !genres.length && <div className="error">{error}</div>}

        {!loadingGenres && Array.isArray(genres) && genres.length > 0 && (
          <motion.div className="genres-list-home">
            {genres.map((genre, index) => {
               if (!genre || typeof genre.id === 'undefined') {
                  console.error("HomePage render: Invalid genre object in genres:", genre, "at index:", index);
                  return null;
                }
              return (
                <motion.div key={genre.id || `genre-${index}`} variants={itemVariants}>
                  <Link
                    to={`/genre/${genre.id}/${encodeURIComponent(genre.name)}`}
                    className="genre-link-home"
                  >
                    <motion.span
                      variants={genreLinkVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      {genre.name}
                    </motion.span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
        {!loadingGenres && Array.isArray(genres) && genres.length === 0 && !error && (
          <p className="info-message">No genres available at the moment.</p>
        )}
      </motion.section>
    </motion.div>
  );
};

export default HomePage;