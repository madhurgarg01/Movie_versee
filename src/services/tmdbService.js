// src/services/tmdbService.js
import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Ensure these are EXPORTED
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const IMAGE_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

// Ensure this function is EXPORTED
export const fetchTrendingMovies = async (timeWindow = 'week') => {
  // console.log("tmdbService: Fetching trending movies. API Key used:", API_KEY ? 'Exists' : 'MISSING!!!');
  try {
    const response = await tmdbApi.get(`/trending/movie/${timeWindow}`);
    if (response.data && response.data.results) {
      // console.log("tmdbService: Successfully fetched trending movies:", response.data.results.length, "items");
      return response.data.results;
    } else {
      console.error("tmdbService: Unexpected response structure for trending movies. Data:", response.data);
      return [];
    }
  } catch (error) {
    console.error('tmdbService: Error fetching trending movies:', error.response ? error.response.data : error.message);
    if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Headers:", error.response.headers);
    } else if (error.request) {
        console.error("Request made but no response received:", error.request);
    }
    return [];
  }
};

// Ensure this function is EXPORTED
export const fetchMovieDetails = async (movieId) => {
  // console.log("tmdbService: Fetching movie details for ID:", movieId);
  try {
    const response = await tmdbApi.get(`/movie/${movieId}`, {
      params: { append_to_response: 'videos,credits,reviews' }, // Make sure this is correct
    });
    // console.log("tmdbService: Movie details response for", movieId, response.data);
    return response.data;
  } catch (error) {
    console.error(`tmdbService: Error fetching details for movie ${movieId}:`, error.response ? error.response.data : error.message);
    return null;
  }
};

// Ensure this function is EXPORTED
export const searchMovies = async (query, page = 1) => {
  // console.log("tmdbService: Searching movies with query:", query, "page:", page);
  try {
    const response = await tmdbApi.get('/search/movie', {
      params: { query, page },
    });
    // console.log("tmdbService: Search results for", query, response.data);
    return response.data;
  } catch (error) {
    console.error(`tmdbService: Error searching movies for query "${query}":`, error.response ? error.response.data : error.message);
    return { results: [], total_pages: 0, page: 1 }; // Return a default structure on error
  }
};

// Ensure this function is EXPORTED
export const fetchGenres = async () => {
  // console.log("tmdbService: Fetching genres. API Key used:", API_KEY ? 'Exists' : 'MISSING!!!');
  try {
    const response = await tmdbApi.get('/genre/movie/list');
    if (response.data && response.data.genres) {
      // console.log("tmdbService: Successfully fetched genres:", response.data.genres.length, "items");
      return response.data.genres;
    } else {
      console.error("tmdbService: Unexpected response structure for genres. Data:", response.data);
      return [];
    }
  } catch (error) {
    console.error('tmdbService: Error fetching genres:', error.response ? error.response.data : error.message);
    if (error.response) {
        console.error("Status:", error.response.status);
    }
    return [];
  }
};

// Ensure this function is EXPORTED
export const fetchMoviesByGenre = async (genreId, page = 1) => {
  if (!genreId) {
    console.error("tmdbService: Genre ID is required for fetchMoviesByGenre");
    return { results: [], total_pages: 0, page: 1 };
  }
  // console.log("tmdbService: Fetching movies by genre ID:", genreId, "page:", page);
  try {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genreId,
        page: page,
        sort_by: 'popularity.desc',
      },
    });
    // console.log("tmdbService: Movies by genre results for", genreId, response.data);
    return response.data;
  } catch (error) {
    console.error(`tmdbService: Error fetching movies for genre ${genreId}:`, error.response ? error.response.data : error.message);
    return { results: [], total_pages: 0, page: 1 };
  }
};