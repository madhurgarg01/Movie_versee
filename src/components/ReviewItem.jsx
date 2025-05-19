// src/components/ReviewItem.jsx
import React from 'react';
import { motion } from 'framer-motion';
import StarRating from './StarRating';
import { useAuth } from '../contexts/AuthContext';
import './ReviewItem.css'; // We'll create this CSS file

const ReviewItem = ({ review, onDelete }) => {
  const { currentUser } = useAuth();
  const isOwner = currentUser && currentUser.uid === review.userId;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      className="review-item"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout // Animates layout changes (e.g., when an item is deleted)
    >
      <div className="review-header">
        <h4 className="review-author">{review.userDisplayName || 'Anonymous'}</h4>
        <span className="review-date">{formatDate(review.createdAt)}</span>
      </div>
      <StarRating initialRating={review.rating} readOnly={true} size={18} />
      {review.reviewText && <p className="review-text">{review.reviewText}</p>}
      {isOwner && (
        <motion.button
          className="delete-review-btn"
          onClick={() => onDelete(review.id)}
          whileHover={{ scale: 1.05, backgroundColor: '#c40812' }}
          whileTap={{ scale: 0.95 }}
        >
          Delete My Review
        </motion.button>
      )}
    </motion.div>
  );
};

export default ReviewItem;