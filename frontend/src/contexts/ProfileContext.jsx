import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [showProfileWarning, setShowProfileWarning] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Replace with your MongoDB API endpoint
        const response = await axios.get(
          `http://localhost:5000/api/users/profile`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const value = {
    showProfileWarning,
    setShowProfileWarning,
    currentUser,
    loading,
  };

  return (
    <ProfileContext.Provider value={value}>
      {!loading && children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
