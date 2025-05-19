// src/components/StarRating.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './StarRating.css'; // We'll create this CSS file

const StarRating = ({
  totalStars = 5,
  initialRating = 0,
  onRatingChange, // Callback when rating changes (for forms)
  readOnly = false,
  size = 24, // Size of stars in pixels
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(initialRating);

  const handleClick = (rating) => {
    if (readOnly) return;
    setCurrentRating(rating);
    if (onRatingChange) {
      onRatingChange(rating);
    }
  };

  const handleMouseEnter = (rating) => {
    if (readOnly) return;
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  // Update currentRating if initialRating prop changes (e.g., form reset)
  React.useEffect(() => {
    setCurrentRating(initialRating);
  }, [initialRating]);


  return (
    <div className={`star-rating ${readOnly ? 'read-only' : ''}`} style={{ '--star-size': `${size}px` }}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <motion.span
            key={starValue}
            className={`star
              ${starValue <= (hoverRating || currentRating) ? 'filled' : ''}
            `}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            whileHover={!readOnly ? { scale: 1.2, color: '#ffc107' } : {}}
            whileTap={!readOnly ? { scale: 0.9 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            ★
          </motion.span>
        );
      })}
      {!readOnly && currentRating > 0 && (
         <span className="clear-rating" onClick={() => handleClick(0)} title="Clear rating">
            ×
        </span>
      )}
    </div>
  );
};

export default StarRating;