// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig'; // Your Firebase auth instance

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  function signup(email, password, displayName) {
    setAuthError(null);
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Set display name
        return updateProfile(userCredential.user, { displayName });
      })
      .catch(error => {
        setAuthError(error.message);
        throw error; // Re-throw to handle in component
      });
  }

  function login(email, password) {
    setAuthError(null);
    return signInWithEmailAndPassword(auth, email, password)
      .catch(error => {
        setAuthError(error.message);
        throw error;
      });
  }

  function logout() {
    setAuthError(null);
    return signOut(auth);
  }

  // Optional: Reset password function
  // function resetPassword(email) {
  //   return sendPasswordResetEmail(auth, email);
  // }

  // Optional: Update email/password functions
  // function updateUserEmail(email) {
  //   return updateEmail(currentUser, email);
  // }
  // function updateUserPassword(password) {
  //   return updatePassword(currentUser, password);
  // }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      setAuthError(null); // Clear error on auth state change
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    authError,
    loadingAuth: loading, // Renamed to avoid conflict if page has its own loading
    setAuthError // Allow components to clear errors if needed
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}