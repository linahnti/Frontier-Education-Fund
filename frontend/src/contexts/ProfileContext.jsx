import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { calculateProfileCompletion } from "../components/ProfileUtils";
import { API_URL } from "../config";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [showProfileWarning, setShowProfileWarning] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/users/profile`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setCurrentUser(response.data);

      // Calculate profile completion
      const { isProfileComplete } = calculateProfileCompletion(
        response.data,
        response.data
      );
      setIsProfileComplete(isProfileComplete);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value = {
    showProfileWarning,
    setShowProfileWarning,
    currentUser,
    loading,
    isProfileComplete,
    setIsProfileComplete,
    refreshProfile: fetchUser,
  };

  return (
    <ProfileContext.Provider value={value}>
      {!loading && children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
