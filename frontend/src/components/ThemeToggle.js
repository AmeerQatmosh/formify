export default function DarkModeToggle({ darkMode, setDarkMode }) {
    return (
      <button 
        onClick={() => setDarkMode(!darkMode)}
        className="px-3 py-1 rounded transition duration-200 
          bg-gray-700 text-white hover:bg-gray-600 dark:bg-gray-300 dark:text-gray-900 dark:hover:bg-gray-400"
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
    );
  }
  