/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkmode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        primary: '#003032',
        secondary: '#FAA41A',
        tertiary: '#2B2E35',
        text: '#000000',
      },
    },
  },
  plugins: [],
};
