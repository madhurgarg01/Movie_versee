// src/components/MovieCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { IMAGE_BASE_URL } from '../services/tmdbService';
import '../styles/MovieCard.css'; // Create this CSS file

const MovieCard = ({ movie, onClick }) => {
  const posterPath = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : 'https://via.placeholder.com/200x300?text=No+Image'; // Placeholder

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.3)" },
    tap: { scale: 0.98 }
  };

  return (
    <motion.div
      className="movie-card"
      onClick={() => onClick(movie.id)}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
    >
      <img src={posterPath} alt={movie.title} />
      <div className="movie-card-content">
        <h3 className="movie-card-title">{movie.title || movie.name}</h3>
        {movie.vote_average > 0 && (
          <p className="movie-card-rating">
            <span className="star">⭐</span> {movie.vote_average.toFixed(1)} / 10
          </p>
        )}
        {/* <p className="movie-card-overview">{movie.overview}</p> */}
      </div>
    </motion.div>
  );
};

export default MovieCard;