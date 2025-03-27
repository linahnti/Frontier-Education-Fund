import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      className="text-white hover:text-yellow-300 mx-4 transition-colors"
      style={{
        fontSize: "1.2rem",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
      }}
    >
      {darkMode ? (
        // Sun icon with rays
        <svg
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ transform: "rotate(0deg)" }}
        >
          <circle cx="12" cy="12" r="4.5" />
          <path
            d="M12 5V3M12 21v-2M16.95 7.05l1.414-1.414M5.636 18.364l1.414-1.414M19 12h2M3 12h2M16.95 16.95l1.414 1.414M5.636 5.636l1.414 1.414"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        // Crescent moon
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
