const defaultTheme = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')

export default {
  content: [
    "./tailwind.config.js",
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', 
  theme: { 
    // Mobile responsiveness is not out of the box, as the smallest default screen 
    // is twice the average width of a typical mobile (cellular) device's viewport:
    screens: {
      'm-s': '300px',
      'm-m': '361px',
      'm-l': '411px',
      'm-xl': '501px',
      ...defaultTheme.screens
    },
    // Positions and styles the overlay label showing current screen breakpoint:
    debugScreens: {
      position: ['bottom', 'left'],
      style: { fontSize: '1.5rem' }
    },
    // Default blur values increase too quickly:
    blur: { 
      '0': '0px',
      'none': '0px',
      'xs': '2px',
      sm: '3px',
      DEFAULT: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
      '2xl': '16px',
      '3xl': '24px',
      '4xl': '36px'
    },
    extend: {
      boxShadow: {
        'xc-light': `2px 0px 2px hsl(210, 100%, 100%, .2), -2px 0px 2px hsl(210, 100%, 100%, .2),  1px 0px 1px hsl(210, 100%, 100%, .1), -1px 0px 1px hsl(210, 100%, 100%, .1), inset 0px -2px 2px hsl(210, 100%, 100%, .2), inset 0px 1px 1px hsl(210, 100%, 100%, .1)`,
        'xc-dark': `2px 0px 2px hsl(210, 0%, 0%, .2),     -2px 0px 2px hsl(210, 0%, 0%, .2),      1px 0px 1px hsl(210, 0%, 0%, .1),     -1px 0px 1px hsl(210, 0%, 0%, .1),     inset 0px 2px 2px hsl(210, 0%, 0%, .2),      inset 0px -1px 1px hsl(210, 0%, 0%, .1)`,
        'form-field-light': `inset 0 -2px 3px hsl(210, 100%, 100%, .2), inset 0 -1px 1px hsl(210, 100%, 100%, .1)`,
        'form-field-dark': `inset 0 -2px 3px hsl(210, 0%, 0%, .2), inset 0 -1px 1px hsl(210, 0%, 0%, .1)`,
        'top': `inset 0 2px 2px var(--tw-shadow-color)`,
      },
      colors: {
        'e8-brand-infinite': '#3B00B9',          // rgb(59, 0, 185) 
        'e8-brand-dark-infinite': '#1E005D',     // rgb(30, 0, 93) 
        'e8-picton-blue': '#29ABE2',             // rgb(41, 171, 226)
        'e8-meteorite': '#522785',               // rgb(82, 39, 133)
        'e8-razzmatazz': '#ED1E79',              // rgb(237, 30, 121)
        'e8-flamingo': '#F15A24',                // rgb(241, 90, 36)
        'e8-sea-buckthorn': '#FBB03B',           // rgb(251, 176, 59)
        'e8-black': '#181818',                   // rgb(24, 24, 24)
        'e8-white': '#fff',                      // rgb(255, 255, 255)
        'e8-g-text-primary': '#6A85F1',
        'e8-g-text-secondary': '#C572EF',
        'u-snow': '#f9f9f9',                     // rgb(249, 249, 249)
        'u-green-success': 'rgba(16, 185, 129, 1)'
      },
      fontFamily: {
        'figtree': ['Figtree', 'sans-serif'],
        'satoshi': ['Satoshi', 'sans-serif'],
        'inconsolata': ['Inconsolata', 'monospace']
      },
      gradientColorStops: {
        'light-primary': '#C0D9FF',
        'light-secondary': '#F0B9E5',
        'dark-primary': '#0E031F',
        'dark-secondary': '#281447',
        'text-primary': '#6A85F1',
        'text-secondary': '#C572EF'
      },
      backgroundImage: theme => ({
        'gradient-light': `linear-gradient(to right, ${theme('gradientColorStops.light-primary')}, ${theme('gradientColorStops.light-secondary')})`,
        'gradient-dark': `linear-gradient(to right, ${theme('gradientColorStops.dark-primary')}, ${theme('gradientColorStops.dark-secondary')})`,
        'gradient-text': `linear-gradient(to right, ${theme('gradientColorStops.text-primary')}, ${theme('gradientColorStops.text-seconadry')})`,
      }),  
      textShadow: {
        sm: '0 1px 2px var(--tw-shadow-color)',
        DEFAULT: '0 2px 4px var(--tw-shadow-color)',
        md: '0 4px 8px var(--tw-shadow-color)',
        lg: '0 8px 16px var(--tw-shadow-color)',
        'inset-xs': `0px -1px 2px var(--tw-shadow-color)`,
        'inset': `0px -2px 3px var(--tw-shadow-color), 0px -1px 1px var(--tw-shadow-color)`,
      },
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-debug-screens'),
    require("tailwind-gradient-mask-image"),
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {'text-shadow': (value) => ({ textShadow: value }) },
        { values: theme('textShadow') }
      )
    }),
  ],
  variants: {
    extend: {
      textColor: ['dark'],
      dropShadow: ['hover', 'focus', 'dark'],
      textShadow: ['responsive', 'hover', 'focus', 'active', 'disabled'],
    }
  }
};