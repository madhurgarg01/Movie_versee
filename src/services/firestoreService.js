// src/services/firestoreService.js
import { db } from '../config/firebaseConfig';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  getDoc
} from 'firebase/firestore';

const WATCHLIST_COLLECTION = 'watchlists';

export const addToWatchlist = async (userId, movie) => {
  console.log("[firestoreService addToWatchlist] Called with userId:", userId, "and movie:", movie);
  if (!userId || !movie || typeof movie.id === 'undefined') {
    console.error("[firestoreService addToWatchlist] ERROR: User ID and valid movie data (with id) are required. Movie ID received:", movie ? movie.id : 'undefined');
    throw new Error("User ID and valid movie data (with movie.id) are required to add to watchlist.");
  }
  try {
    const movieId = Number(movie.id);
    if (isNaN(movieId)) {
        console.error("[firestoreService addToWatchlist] ERROR: movie.id could not be converted to a number. Original movie.id:", movie.id);
        throw new Error("Invalid movie ID format.");
    }
    const docId = `${userId}_${movieId}`;
    const watchlistRef = doc(db, WATCHLIST_COLLECTION, docId);
    console.log("[firestoreService addToWatchlist] Attempting to set document with ID:", docId);

    const dataToSave = {
      userId: userId,
      movieId: movieId,
      title: movie.title || movie.name || "Untitled Movie",
      poster_path: movie.poster_path || null, // Save relative path from TMDb
      release_date: movie.release_date || null,
      vote_average: typeof movie.vote_average !== 'undefined' ? Number(movie.vote_average) : 0,
      addedAt: Timestamp.now()
    };
    console.log("[firestoreService addToWatchlist] Data to save to Firestore:", dataToSave);

    await setDoc(watchlistRef, dataToSave);
    console.log("[firestoreService addToWatchlist] SUCCESS: Movie added/updated in watchlist with docId:", docId);
  } catch (error) {
    console.error("[firestoreService addToWatchlist] ERROR adding movie to watchlist: ", error.code, error.message, error);
    throw error; // Re-throw to be caught by the calling component
  }
};

export const removeFromWatchlist = async (userId, movieId) => {
  console.log("[firestoreService removeFromWatchlist] Called with userId:", userId, "movieId:", movieId);
  if (!userId || typeof movieId === 'undefined') {
    console.error("[firestoreService removeFromWatchlist] ERROR: User ID and Movie ID are required. Movie ID received:", movieId);
    throw new Error("User ID and Movie ID are required for removal.");
  }
  try {
    const numericMovieId = Number(movieId);
    if (isNaN(numericMovieId)) {
        console.error("[firestoreService removeFromWatchlist] ERROR: movieId could not be converted to a number. Original movieId:", movieId);
        throw new Error("Invalid movie ID format for removal.");
    }
    const docId = `${userId}_${numericMovieId}`;
    const watchlistRef = doc(db, WATCHLIST_COLLECTION, docId);
    await deleteDoc(watchlistRef);
    console.log("[firestoreService removeFromWatchlist] SUCCESS: Movie removed from watchlist, docId:", docId);
  } catch (error) {
    console.error("[firestoreService removeFromWatchlist] ERROR removing movie from watchlist: ", error.code, error.message, error);
    throw error;
  }
};

export const getUserWatchlist = async (userId) => {
  console.log("[A1 - firestoreService] getUserWatchlist: Called for userId:", userId);
  if (!userId) {
    console.warn("[A2 - firestoreService] getUserWatchlist: No userId provided, returning empty array.");
    return [];
  }
  try {
    const q = query(collection(db, WATCHLIST_COLLECTION), where("userId", "==", userId));
    console.log("[A3 - firestoreService] getUserWatchlist: Executing query for userId:", userId);
    const querySnapshot = await getDocs(q);
    const watchlist = [];
    console.log("[A4 - firestoreService] getUserWatchlist: Query snapshot size:", querySnapshot.size);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("[A5 - firestoreService] getUserWatchlist: Document found:", doc.id, "Raw Data:", data);
      if (typeof data.movieId !== 'undefined' && data.title && typeof data.poster_path !== 'undefined') { // Stricter check for needed fields
        watchlist.push({ firestoreDocId: doc.id, ...data });
      } else {
        console.warn("[A6 - firestoreService] getUserWatchlist: Document", doc.id, "is missing essential fields (movieId, title, or poster_path). Data:", data);
      }
    });

    if (watchlist.length > 0 && watchlist[0].addedAt && typeof watchlist[0].addedAt.toMillis === 'function') {
        watchlist.sort((a, b) => (b.addedAt.toMillis()) - (a.addedAt.toMillis()));
    }

    console.log("[A7 - firestoreService] getUserWatchlist: Returning watchlist (count):", watchlist.length, "Full Data:", watchlist);
    return watchlist;
  } catch (error) {
    console.error("[A8 - firestoreService] getUserWatchlist: ERROR fetching user watchlist: ", error.code, error.message, error);
    return [];
  }
};

export const isMovieInWatchlist = async (userId, movieId) => {
  console.log(`[firestoreService isMovieInWatchlist] Checking userId: ${userId}, movieId: ${movieId}`);
  if (!userId || typeof movieId === 'undefined') {
    console.warn(`[firestoreService isMovieInWatchlist] Invalid input - userId or movieId undefined.`);
    return false;
  }
  try {
    const numericMovieId = Number(movieId);
    if (isNaN(numericMovieId)) {
        console.warn(`[firestoreService isMovieInWatchlist] Invalid movieId format: ${movieId}`);
        return false;
    }
    const docId = `${userId}_${numericMovieId}`;
    const docRef = doc(db, WATCHLIST_COLLECTION, docId);
    const docSnap = await getDoc(docRef);
    console.log(`[firestoreService isMovieInWatchlist] Document ${docId} exists?`, docSnap.exists());
    return docSnap.exists();
  } catch (error) {
    console.error("[firestoreService isMovieInWatchlist] ERROR checking movie in watchlist: ", error.code, error.message, error);
    return false;
  }
};