import { createContext, useState, useContext } from "react";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [showProfileWarning, setShowProfileWarning] = useState(false);

  return (
    <ProfileContext.Provider
      value={{ showProfileWarning, setShowProfileWarning }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
