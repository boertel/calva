const colors = require("tailwindcss/colors");

module.exports = {
  mode: "jit",
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      colors: colors,
      gridTemplateColumns: {
        events: "max-content minmax(300px, 65ch) max-content",
      },
      boxShadow: {
        xl: "0px 0.4px 0.5px hsl(var(--shadow-color) / 0.34), 0px 2px 2.3px -0.4px hsl(var(--shadow-color) / 0.34), 0px 3.8px 4.3px -0.7px hsl(var(--shadow-color) / 0.34), 0.1px 6.3px 7.1px -1.1px hsl(var(--shadow-color) / 0.34), 0.1px 10px 11.3px -1.4px hsl(var(--shadow-color) / 0.34), 0.2px 15.6px 17.6px -1.8px hsl(var(--shadow-color) / 0.34), 0.2px 23.8px 26.8px -2.1px hsl(var(--shadow-color) / 0.34), 0.4px 35px 39.4px -2.5px hsl(var(--shadow-color) / 0.34)",
      },
      animation: {
        shake: "shake 1s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        pulse: {
          "0%, 100%": {
            opacity: 0.4,
          },
          "50%": {
            opacity: 0.05,
          },
        },
        shake: {
          "10%, 90%": {
            transform: "translate3d(-1px, 0, 0)",
          },
          "20%, 80%": {
            transform: "translate3d(2px, 0, 0)",
          },
          "30%, 50%, 70%": {
            transform: "translate3d(-4px, 0, 0)",
          },
          "40%, 60%": {
            transform: "translate3d(4px, 0, 0)",
          },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
