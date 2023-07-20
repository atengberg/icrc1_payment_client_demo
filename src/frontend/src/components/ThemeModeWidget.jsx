import useTheme from "../hooks/useTheme";
import { RiMoonLine, RiSunLine } from "./Icons";

const ThemeModeWidget = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  return (
    <button 
      className="z-[99]"
      aria-pressed={darkMode}
      title={`Toggle ${darkMode ? 'Light' : 'Dark'} Mode`}
      aria-labelledby='theme-switch-label'
      role="switch"
      onClick={() => toggleDarkMode()} 
    >
      {darkMode 
        ? <RiMoonLine aria-hidden={true} className="stylish-menu-icon" />
        : <RiSunLine aria-hidden={true} className="stylish-menu-icon" />
      }
      <label className="sr-only" id="theme-switch-label" name="theme-switch-label">
        {`toggle ${darkMode ? 'light' : 'dark'} mode`}
      </label>
    </button>
  );
};

export default ThemeModeWidget;