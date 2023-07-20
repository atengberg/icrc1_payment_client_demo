import { useState, useLayoutEffect, useCallback, useMemo } from 'react';

/** Standard Tailwind theme toggling functionality. */
const useTheme = () => {
  const [toggle,setToggle] = useState((
    localStorage.themeMode === 'dark' 
    || (!('themeMode' in localStorage) 
    && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ));

  useLayoutEffect(() => {
      document.documentElement.classList[toggle ? 'add' : 'remove']('dark'); 
  }, [toggle]);

  const toggleDarkMode = useCallback(() => { 
    toggle ? localStorage.removeItem("themeMode") : localStorage.setItem("themeMode", "dark");
    setToggle(() => !toggle);
  }, [toggle, setToggle]);

  return useMemo(() => ({ 
    darkMode: toggle, 
    toggleDarkMode 
  }), [ 
    toggle, 
    toggleDarkMode 
  ]);
};

export default useTheme;

