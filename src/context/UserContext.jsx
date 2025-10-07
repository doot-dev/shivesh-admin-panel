import React, { createContext, useContext, useState, useEffect } from 'react';
import { localStorageKeys } from '../constant/constant';
import { encrypt, decrypt } from '../utils/security';

// Create the UserContext
const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// UserProvider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data from encrypted localStorage on mount
  useEffect(() => {
    try {
      const encryptedUserData = localStorage.getItem(localStorageKeys.userData);
      console.log('Encrypted user data from localStorage:', encryptedUserData);
      if (encryptedUserData) {
        const decryptedData = decrypt(encryptedUserData);
        console.log('Decrypted user data:', decryptedData);
        if (decryptedData) {
          const userData = JSON.parse(decryptedData);
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error loading user data from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to update user data
  const updateUser = (userData) => {
    try {
      setUser(userData);
      const encryptedData = encrypt(JSON.stringify(userData));
      localStorage.setItem(localStorageKeys.userData, encryptedData);
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
    }
  };

  // Function to clear user data
  const logoutUser = () => {
    try {
      setUser(null);
      localStorage.removeItem(localStorageKeys.userData);
    } catch (error) {
      console.error('Error clearing user data from localStorage:', error);
    }
  };

  // Function to check if user is logged in
  const isLoggedIn = () => {
    return user !== null;
  };

  // Function to get user name
  const getUserName = () => {
    console.log('Getting user name:', user);
    return user?.name;
  };

  // Function to get user role
  const getUserRole = () => {
    return user?.role;
  };

  const value = {
    user,
    loading,
    updateUser,
    logoutUser,
    isLoggedIn,
    getUserName,
    getUserRole,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;