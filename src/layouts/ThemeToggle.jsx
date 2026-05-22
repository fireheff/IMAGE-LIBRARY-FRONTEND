// Small floating theme toggle button.
// Switches between light and dark mode.

function ThemeToggle({ theme, onToggle }) {
  // Checks whether dark mode is currently active.
  const isDark = theme === "dark";

  return (
    <button
      // Toggle theme when clicked.
      onClick={onToggle}
      // Accessibility label for screen readers.
      aria-label="Toggle theme"
      // Fixed floating button in the top-right corner.
      className={`fixed right-2 top-11 z-50 h-6 w-6 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
        isDark
          ? // Dark mode appearance.
            "bg-white shadow-[0_8px_30px_rgba(255,255,255,0.25)]"
          : // Light mode appearance.
            "bg-black shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
      }`}
    />
  );
}

export default ThemeToggle;
